import CustomButtomSheet from "@/components/CustomButtomSheet";
import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import {
  AreaPickerSheet,
  StatePickerSheet,
} from "@/components/DeliveryLocationSheets";
import RetryButton from "@/components/RetryButton";
import SavedAddressField from "@/components/SavedAddressField";
import SavedAddressSheet, {
  type SavedAddress,
} from "@/components/SavedAddressSheet";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import TextArea from "@/components/TextArea";
import { axiosClient } from "@/globalApi";
import { useProfileStore } from "@/store/ProfileStore";
import type {
  ApiAddress,
  GiftCheckoutForm,
  GiftCheckoutRouteParams,
} from "@/types";
import displayCurrency from "@/utils/displayCurrency";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";
import { z } from "zod";

const giftCheckoutSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .refine(
      (value) =>
        value.startsWith("0") ? value.length === 11 : value.length === 10,
      {
        message:
          "Phone number must be 11 digits if it starts with 0, otherwise 10 digits",
      },
    ),
  state: z.string().trim().min(1, "State is required"),
  deliveryArea: z.string().trim().min(1, "Delivery area is required"),
  streetAddress: z.string().trim().min(1, "Street address is required"),
  apartment: z.string().optional(),
  zipCode: z.string().optional(),
  deliveryNote: z.string().max(300, "Delivery note cannot exceed 300 characters"),
});

type CheckoutField = keyof z.infer<typeof giftCheckoutSchema>;

type GiftProduct = {
  id: string;
  name: string;
  weight: string;
  quantity: number;
};

type GiftBoxDetails = {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  products: GiftProduct[];
};

const mapAddress = (address: ApiAddress): SavedAddress => {
  const value = address.attributes ?? {};
  return {
    id: String(address.id),
    label: value.label || value.street_address || "Address",
    recipient: `${value.first_name ?? ""} ${value.last_name ?? ""}`.trim(),
    email: value.email ?? "",
    phone: value.phone ?? "",
    streetAddress: value.street_address ?? "",
    apartment: value.apartment_suite ?? "",
    deliveryArea: value.city ?? "",
    state: value.state ?? "",
    zipCode: value.zip_code ?? "",
  };
};

const mapGiftBox = (item: any): GiftBoxDetails => {
  const attributes = item.attributes ?? {};
  return {
    id: String(item.id),
    name: attributes.name ?? "Gift Box",
    description: attributes.description ?? "",
    price: Number(attributes.price ?? 0),
    weight: `${attributes.weight ?? "-"}${attributes.weight_unit ?? ""}`,
    products: (attributes.products ?? []).map((line: any, index: number) => {
      const product = line.product_id ?? {};
      const weight =
        line.weight !== undefined
          ? `${line.weight}${line.weight_unit ?? ""}`
          : product.formattedWeight ?? "";
      return {
        id: String(product._id ?? product.id ?? `${item.id}-${index}`),
        name: product.name ?? "Item",
        weight,
        quantity: Number(line.quantity ?? 1),
      };
    }),
  };
};

const GiftCheckoutScreen = () => {
  const params = useLocalSearchParams<GiftCheckoutRouteParams>();
  const toast = useToast();
  const profile = useProfileStore((state) => state.userProfile);
  const orderSummaryRef = useRef<BottomSheetModal>(null);
  const savedAddressRef = useRef<BottomSheetModal>(null);
  const statePickerRef = useRef<BottomSheetModal>(null);
  const areaPickerRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);

  const [form, setForm] = useState<GiftCheckoutForm>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    state: "Lagos",
    isDefaultAddress: false,
    deliveryArea: "",
    streetAddress: "",
    apartment: "",
    zipCode: "",
    deliveryNote: "",
  });
  const [giftBox, setGiftBox] = useState<GiftBoxDetails | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [resolvedAddressId, setResolvedAddressId] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resolvingOrder, setResolvingOrder] = useState(false);
  const [paying, setPaying] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<CheckoutField, boolean>>
  >({});

  const validation = giftCheckoutSchema.safeParse(form);
  const errors: Partial<Record<CheckoutField, string>> = {};
  if (!validation.success) {
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0] as CheckoutField;
      errors[field] ??= issue.message;
    });
  }

  const fieldError = (field: CheckoutField) =>
    hasSubmitted || touched[field] ? errors[field] : undefined;

  const touchField = (field: CheckoutField) =>
    setTouched((current) => ({ ...current, [field]: true }));

  const clearResolvedAddress = () => {
    setSelectedAddressId("");
    setResolvedAddressId("");
    setDeliveryFee(0);
  };

  const update = <K extends keyof GiftCheckoutForm>(
    key: K,
    value: GiftCheckoutForm[K],
    addressChanged = false,
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (addressChanged) clearResolvedAddress();
  };

  const loadAddresses = useCallback(async () => {
    try {
      setLoadingAddresses(true);
      setAddressError(null);
      const response = await axiosClient.get("/addresses");
      setAddresses(
        ((response.data?.data ?? []) as ApiAddress[]).map(mapAddress),
      );
    } catch (error: any) {
      setAddresses([]);
      setAddressError(
        error.response?.data?.message ??
          "Unable to load your saved addresses. Please try again.",
      );
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  const loadCheckout = useCallback(async () => {
    if (!params.giftId) {
      setLoadError("The selected gift box is unavailable. Please choose it again.");
      setInitialLoading(false);
      return;
    }

    try {
      setInitialLoading(true);
      setLoadError(null);
      const [, giftResponse] = await Promise.all([
        loadAddresses(),
        axiosClient.get(`/giftboxes/${params.giftId}`),
      ]);
      const giftData = giftResponse.data?.data;
      if (!giftData) throw new Error("The selected gift box could not be found.");

      setGiftBox(mapGiftBox(giftData));
    } catch (error: any) {
      setGiftBox(null);
      setLoadError(
        error.response?.data?.message ??
          error.message ??
          "Unable to load gift checkout details. Please try again.",
      );
    } finally {
      setInitialLoading(false);
    }
  }, [loadAddresses, params.giftId]);

  useEffect(() => {
    void loadCheckout();
  }, [loadCheckout]);

  const selectSavedAddress = (address: SavedAddress) => {
    const [firstName, ...remainingNames] = address.recipient.split(" ");
    setForm((current) => ({
      ...current,
      firstName: firstName ?? "",
      lastName: remainingNames.join(" "),
      email: address.email || current.email,
      phoneNumber: address.phone,
      state: address.state,
      deliveryArea: address.deliveryArea,
      streetAddress: address.streetAddress,
      apartment: address.apartment,
      zipCode: address.zipCode,
    }));
    setSelectedAddressId(address.id);
    setResolvedAddressId("");
    setDeliveryFee(0);
    savedAddressRef.current?.dismiss();
  };

  const enterAddressManually = () => {
    setForm((current) => ({
      ...current,
      streetAddress: "",
      apartment: "",
      deliveryArea: "",
      zipCode: "",
    }));
    clearResolvedAddress();
    savedAddressRef.current?.dismiss();
  };

  const selectState = (state: string) => {
    setForm((current) => ({ ...current, state, deliveryArea: "" }));
    clearResolvedAddress();
    touchField("state");
    statePickerRef.current?.dismiss();
  };

  const selectDeliveryArea = (deliveryArea: string) => {
    update("deliveryArea", deliveryArea, true);
    touchField("deliveryArea");
    areaPickerRef.current?.dismiss();
  };

  const openOrderSummary = async () => {
    setHasSubmitted(true);
    if (!validation.success || !giftBox) return;

    try {
      setResolvingOrder(true);
      let addressId = selectedAddressId;
      if (!addressId) {
        const addressResponse = await axiosClient.post("/addresses", {
          address_type: "shipping",
          label: "Gift Delivery",
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phoneNumber.trim(),
          street_address: form.streetAddress.trim(),
          apartment_suite: form.apartment.trim(),
          city: form.deliveryArea.trim(),
          state: form.state.trim(),
          zip_code: form.zipCode.trim(),
          country: "Nigeria",
          is_default: form.isDefaultAddress,
        });
        addressId = String(addressResponse.data?.data?.id ?? "");
      }

      if (!addressId) throw new Error("The delivery address was not created.");
      const quoteResponse = await axiosClient.post("/delivery/quote", {
        address_id: addressId,
      });
      setResolvedAddressId(addressId);
      setDeliveryFee(
        Number(quoteResponse.data?.data?.attributes?.delivery_fee) || 0,
      );
      orderSummaryRef.current?.present();
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ??
          error.message ??
          "Unable to calculate the delivery fee.",
        { type: "danger" },
      );
    } finally {
      setResolvingOrder(false);
    }
  };

  const payNow = async () => {
    if (!giftBox || !resolvedAddressId) return;

    try {
      setPaying(true);
      const response = await axiosClient.post("/gifts", {
        recipient_email: params.recipientEmail ?? "",
        recipient_name: params.recipientName ?? "",
        recipient_phone: params.recipientPhone ?? "",
        occasion: params.occasion ?? "",
        gift_box_id: giftBox.id,
        message: params.giftNote ?? "",
        delivery_date: params.deliveryDate ?? "",
        delivery_window_label: params.deliveryWindow ?? "",
        delivery_note: form.deliveryNote.trim(),
        address_id: resolvedAddressId,
      });
      const paymentLink =
        response.data?.data?.attributes?.payment?.authorization_url;
      if (!paymentLink) throw new Error("The payment link was not returned.");

      orderSummaryRef.current?.dismiss();
      router.push({
        pathname: "/(protected)/(routes)/PaymentGateway",
        params: { paymentLink },
      });
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ??
          error.message ??
          "Unable to initialize gift payment.",
        { type: "danger" },
      );
    } finally {
      setPaying(false);
    }
  };

  const total = (giftBox?.price ?? 0) + deliveryFee;

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <StatusBar style="dark" />
        <View className="px-4">
          <SpaceBetweenHeader onBackPress={() => router.back()} showRight={false} />
        </View>

        {initialLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#218225" />
            <Text className="mt-2 font-mregular text-xs text-gray">
              Loading gift checkout...
            </Text>
          </View>
        ) : loadError ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="gift-outline" size={34} color="#8E8E8E" />
            <Text className="mt-4 text-center font-mbold text-xl">
              Couldn't load gift checkout
            </Text>
            <Text className="mt-2 text-center font-mregular text-sm leading-6 text-gray">
              {loadError}
            </Text>
            <RetryButton
              onPress={() => void loadCheckout()}
              containerStyles="mt-5"
            />
          </View>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 20,
            }}
          >
            <Text className="font-mbold text-2xl">Delivery Information</Text>
            <View className="mt-4 gap-4">
              <SavedAddressField
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onPress={() => savedAddressRef.current?.present()}
              />
              <FormField title="First name" required value={form.firstName} placeholder="Adebola" handleChangeText={(value) => update("firstName", value, true)} onBlur={() => touchField("firstName")} error={fieldError("firstName")} />
              <FormField title="Last name" required value={form.lastName} placeholder="Okonkwo" handleChangeText={(value) => update("lastName", value, true)} onBlur={() => touchField("lastName")} error={fieldError("lastName")} />
              <FormField title="Email" required value={form.email} placeholder="you@example.com" handleChangeText={(value) => update("email", value, true)} keyboardType="email-address" autoCapitalize="none" onBlur={() => touchField("email")} error={fieldError("email")} />
              <FormField title="Phone Number" required value={form.phoneNumber} placeholder="08123456789" handleChangeText={(value) => update("phoneNumber", value, true)} keyboardType="phone-pad" maxLength={11} onBlur={() => touchField("phoneNumber")} error={fieldError("phoneNumber")} />
              <FormField title="State" required value={form.state} placeholder="Select your state" disabled onPress={() => statePickerRef.current?.present()} rightElement={<Ionicons name="chevron-down" size={22} color="#8E8E8E" />} error={fieldError("state")} />
              <FormField title="Delivery Area" required value={form.deliveryArea} placeholder="Select your delivery area" disabled onPress={() => areaPickerRef.current?.present()} rightElement={<Ionicons name="chevron-down" size={22} color="#8E8E8E" />} error={fieldError("deliveryArea")} />
              <View className="flex-row items-center gap-1">
                <Switch value={form.isDefaultAddress} onValueChange={(value) => update("isDefaultAddress", value)} trackColor={{ false: "#D5D5D5", true: "#8FC895" }} thumbColor={form.isDefaultAddress ? "#218225" : "#FFFFFF"} />
                <Text className="font-mregular text-base">Set as default address</Text>
              </View>
              <FormField title="Street Address" required value={form.streetAddress} placeholder="12 Adeniyi Jones Avenue" handleChangeText={(value) => update("streetAddress", value, true)} onBlur={() => touchField("streetAddress")} error={fieldError("streetAddress")} />
              <FormField title="Apartment" value={form.apartment} placeholder="e.g First Floor, Room 10" handleChangeText={(value) => update("apartment", value, true)} />
              <FormField title="Zip Code" optional value={form.zipCode} placeholder="102040" handleChangeText={(value) => update("zipCode", value, true)} keyboardType="number-pad" maxLength={6} />
              <View>
                <Text className="font-msbold text-xl">Delivery Note <Text className="font-mregular text-sm text-gray">(Optional)</Text></Text>
                <TextArea value={form.deliveryNote} placeholder="Gate code, call instructions, or preferred drop-off note." handleChangeText={(value) => update("deliveryNote", value)} maxLength={300} inputContainerStyles="mt-2" />
                <Text className="mt-2 text-right font-mregular text-sm text-gray">{form.deliveryNote.length}/300 characters</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {!initialLoading && !loadError ? (
          <View className="px-4">
            <CustomButton title="Continue" handlePress={openOrderSummary} isLoading={resolvingOrder} disableButton={!giftBox} containerStyles="mb-1 mt-2 w-full" textStyles="text-white" />
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <SavedAddressSheet
        addresses={addresses}
        ref={savedAddressRef}
        selectedAddressId={selectedAddressId}
        onSelect={selectSavedAddress}
        onEnterManually={enterAddressManually}
        refreshing={loadingAddresses}
        error={addressError}
        onRefresh={() => void loadAddresses()}
      />
      <StatePickerSheet ref={statePickerRef} selectedState={form.state} onSelect={selectState} />
      <AreaPickerSheet ref={areaPickerRef} state={form.state} selectedArea={form.deliveryArea} onSelect={selectDeliveryArea} />

      <CustomButtomSheet ref={orderSummaryRef} snapPoints={snapPoints} dynamicSizing={false} enablePenDown={false} scrollable>
        <View className="h-full">
          <Pressable accessibilityRole="button" accessibilityLabel="Close order summary" onPress={() => orderSummaryRef.current?.dismiss()} className="mb-3 size-12 items-center justify-center rounded-full bg-green-light">
            <Ionicons name="arrow-back" size={22} color="#218225" />
          </Pressable>
          <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
            <View>
              <Text className="font-mbold text-2xl">Order Summary</Text>
              <Text className="font-mregular text-sm text-gray">Confirm your gift box and delivery details before payment.</Text>
            </View>
            <View className="rounded-2xl bg-white p-4">
              <Text className="font-mbold text-xl">{giftBox?.name ?? "Gift Box"}</Text>
              <Text className="mt-1 font-mregular text-sm text-gray">{giftBox?.description}</Text>
              <SpaceBetween title="Weight" value={giftBox?.weight ?? "—"} containerStyles="mt-4" titleStyles="text-gray" />
            </View>
            <View className="rounded-2xl bg-white p-4">
              <Text className="mb-3 font-mbold text-xl">Included cuts</Text>
              {giftBox?.products.length ? giftBox.products.map((item, index) => (
                <View key={`${item.id}-${index}`} className={`flex-row items-center justify-between gap-3 ${index ? "mt-3" : ""}`}>
                  <View className="min-w-0 flex-1 flex-row items-center gap-2">
                    <Text className="flex-shrink font-mregular text-sm text-gray">{item.name}</Text>
                    {item.quantity > 1 ? <View className="rounded-full bg-green-light px-2 py-1"><Text className="font-msbold text-[10px] text-green">{item.quantity}x</Text></View> : null}
                  </View>
                  <Text className="font-msbold text-xs">{item.weight}</Text>
                </View>
              )) : <Text className="font-mregular text-sm text-gray">No included cuts available.</Text>}
            </View>
            <View className="rounded-2xl bg-white p-4">
              <Text className="mb-3 font-mbold text-xl text-green">Recipient Information</Text>
              <SpaceBetween title="Recipient name" value={params.recipientName ?? "—"} titleStyles="text-gray" />
              <SpaceBetween title="Phone Number" value={params.recipientPhone ?? "—"} containerStyles="mt-3" titleStyles="text-gray" />
              <SpaceBetween title="Email" value={params.recipientEmail || "—"} containerStyles="mt-3" titleStyles="text-gray" />
              <SpaceBetween title="Occasion" value={params.occasion ?? "—"} containerStyles="mt-3" titleStyles="text-gray" />
              <SpaceBetween title="Delivery date" value={params.deliveryDate ?? "—"} containerStyles="mt-3" titleStyles="text-gray" />
              <SpaceBetween title="Delivery window" value={params.deliveryWindow ?? "—"} containerStyles="mt-3" titleStyles="text-gray" />
              {params.giftNote ? <View className="mt-4"><Text className="font-msbold text-sm text-green">Gift note</Text><Text className="mt-2 font-mregular text-sm leading-6 text-gray">{params.giftNote}</Text></View> : null}
            </View>
            <View className="rounded-2xl bg-white p-4">
              <SpaceBetween title="Box price" value={displayCurrency(giftBox?.price ?? 0, "NGN")} titleStyles="text-gray" />
              <SpaceBetween title="Delivery Fee" value={displayCurrency(deliveryFee, "NGN")} containerStyles="mt-2" titleStyles="text-gray" />
              <View className="my-2 h-px bg-gray-200" />
              <SpaceBetween title="Total" value={displayCurrency(total, "NGN")} titleStyles="font-mbold text-lg" valueStyles="font-msbold text-lg text-green" />
            </View>
            <Text className="font-mregular text-xs text-gray">Make sure you complete delivery information before payment.</Text>
          </BottomSheetScrollView>
          <CustomButton title="Pay Now" handlePress={payNow} isLoading={paying} containerStyles="mb-2 mt-4 w-full" textStyles="text-white" />
        </View>
      </CustomButtomSheet>
    </SafeAreaView>
  );
};

export default GiftCheckoutScreen;
