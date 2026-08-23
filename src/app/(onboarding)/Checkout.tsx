import CustomButtomSheet from "@/components/CustomButtomSheet";
import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import RetryButton from "@/components/RetryButton";
import SavedAddressField from "@/components/SavedAddressField";
import {
  AreaPickerSheet,
  StatePickerSheet,
} from "@/components/DeliveryLocationSheets";
import SavedAddressSheet, {
  type SavedAddress,
} from "@/components/SavedAddressSheet";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import TextArea from "@/components/TextArea";
import { getDeliveryState } from "@/constants/data";
import { axiosClient } from "@/globalApi";
import { useProfileStore } from "@/store/ProfileStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import type { ApiAddress } from "@/types";
import { getFrequencyWeeks } from "@/utils/conversion";
import displayCurrency from "@/utils/displayCurrency";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetSectionList } from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
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
import {
  hideLoader,
  showLoader,
  useIsLoading,
} from "@/store/LoaderStore";

const frontendUrl =
  process.env.EXPO_PUBLIC_FRONTEND_URL ?? "https://meatng.com";
const termsUrl = `${frontendUrl}/MeatNG_Terms_and_Conditions.pdf`;
const privacyUrl = `${frontendUrl}/MeatNG_Privacy_Policy.pdf`;

const checkoutSchema = z.object({
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
  city: z.string().trim().min(1, "Delivery area is required"),
  streetAddress: z.string().trim().min(1, "Street address is required"),
  apartment: z.string().optional(),
  zipCode: z.string().optional(),
  deliveryNote: z.string().max(300, "Delivery note cannot exceed 300 characters"),
});

type CheckoutField = keyof z.infer<typeof checkoutSchema>;
type CheckoutForm = z.infer<typeof checkoutSchema> & {
  isDefaultAddress: boolean;
};

type CartProduct = {
  id?: string;
  name?: string;
  formattedWeight?: string;
};

type CartLine = {
  productId?: CartProduct;
  quantity?: number;
  item_type?: string;
};

type SummaryItem =
  | {
      type: "prefilled";
      id: string;
      name: string;
      weight: string;
      quantity: number;
    }
  | {
      type: "base" | "addon";
      id: string;
      name: string;
      weight: string;
      quantity: number;
    };

type SummarySection = {
  type: SummaryItem["type"];
  title: string;
  data: SummaryItem[];
};

type CheckoutCart = {
  id: string;
  attributes: {
    items?: CartLine[];
    totalPrice?: number;
    addonTotal?: number;
    planUnitPrice?: number;
  };
};

const mapAddress = (address: ApiAddress): SavedAddress => {
  const value = address.attributes ?? {};
  return {
    id: String(address.id),
    label: value.label || value.street_address || "Address",
    recipient: `${value.first_name ?? ""} ${value.last_name ?? ""}`.trim(),
    phone: value.phone ?? "",
    streetAddress: value.street_address ?? "",
    apartment: value.apartment_suite ?? "",
    deliveryArea: value.city ?? "",
    state: value.state ?? "",
    zipCode: value.zip_code ?? "",
  };
};

const Checkout = () => {

  const toast = useToast();
  const isLoading = useIsLoading();
  const subInfo = useSubscriptionStore((state) => state.subInfo);
  const profile = useProfileStore((state) => state.userProfile);
  const attributes = subInfo?.subscription?.attributes;
  const savedAddressRef = useRef<BottomSheetModal>(null);
  const statePickerRef = useRef<BottomSheetModal>(null);
  const areaPickerRef = useRef<BottomSheetModal>(null);
  const summaryRef = useRef<BottomSheetModal>(null);
  const summarySnapPoints = useMemo(() => ["90%"], []);

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [form, setForm] = useState<CheckoutForm>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    state: "Lagos",
    city: "",
    streetAddress: "",
    apartment: "",
    zipCode: "",
    deliveryNote: "",
    isDefaultAddress: false,
  });
  const [cart, setCart] = useState<CheckoutCart | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [resolvedAddressId, setResolvedAddressId] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({});

  const validation = checkoutSchema.safeParse(form);
  const errors: Partial<Record<CheckoutField, string>> = {};
  if (!validation.success) {
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0] as CheckoutField;
      errors[field] ??= issue.message;
    });
  }
  const fieldError = (field: CheckoutField) =>
    hasSubmitted || touched[field] ? errors[field] : undefined;
  const touch = (field: CheckoutField) =>
    setTouched((current) => ({ ...current, [field]: true }));

  const clearResolvedAddress = () => {
    setSelectedAddressId("");
    setResolvedAddressId("");
    setDeliveryFee(0);
  };

  const updateForm = <K extends keyof CheckoutForm>(
    field: K,
    value: CheckoutForm[K],
    addressChanged = false,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
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
    try {
      setLoadingData(true);
      setLoadError(null);
      const [, cartResponse] = await Promise.all([
        loadAddresses(),
        axiosClient.get("/carts/my-cart"),
      ]);
      const checkoutCart = cartResponse.data?.data ?? null;

      if (!checkoutCart) {
        throw new Error("Your cart could not be found. Please review your cart and try again.");
      }

      setCart(checkoutCart);
    } catch (error: any) {
      setCart(null);
      setLoadError(
        error.response?.data?.message ??
          error.message ??
          "Unable to load your checkout details. Please try again.",
      );
    } finally {
      setLoadingData(false);
    }
  }, [loadAddresses]);

  useFocusEffect(
    useCallback(() => {
      if (!subInfo?.subscription || !subInfo.selectedFrequency) {
        router.replace("/(onboarding)/Plans");
        return;
      }

      void loadCheckout();
    }, [loadCheckout, subInfo]),
  );

  const selectSavedAddress = (address: SavedAddress) => {
    const [selectedFirstName, ...remainingNames] = address.recipient.split(" ");
    setSelectedAddressId(address.id);
    setResolvedAddressId("");
    setDeliveryFee(0);
    setForm((current) => ({
      ...current,
      firstName: selectedFirstName ?? "",
      lastName: remainingNames.join(" "),
      phoneNumber: address.phone,
      state: address.state,
      city: address.deliveryArea,
      streetAddress: address.streetAddress,
      apartment: address.apartment,
      zipCode: address.zipCode,
    }));
    savedAddressRef.current?.dismiss();
  };

  const enterAddressManually = () => {
    setSelectedAddressId("");
    setResolvedAddressId("");
    setDeliveryFee(0);
    setForm((current) => ({
      ...current,
      streetAddress: "",
      apartment: "",
      city: "",
      zipCode: "",
    }));
    savedAddressRef.current?.dismiss();
  };

  const openSummary = async () => {
    if (isLoading) return;

    setHasSubmitted(true);
    if (!validation.success) return;

    try {
      showLoader();
      let addressId = selectedAddressId;

      if (!addressId) {
        const addressResponse = await axiosClient.post("/addresses", {
          address_type: "shipping",
          label: "Home",
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phoneNumber.trim(),
          street_address: form.streetAddress.trim(),
          apartment_suite: (form.apartment ?? "").trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zip_code: (form.zipCode ?? "").trim(),
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
      summaryRef.current?.present();
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ??
          error.message ??
          "Unable to calculate the delivery fee.",
        { type: "danger" },
      );
    } finally {
      hideLoader();
    }
  };

  const payNow = async () => {
    if (isLoading) return;
    if (!resolvedAddressId) return;
    try {
      showLoader();
      const response = await axiosClient.post("/checkout", {
        address_id: resolvedAddressId,
        delivery_note: form.deliveryNote.trim(),
        frequency_weeks: getFrequencyWeeks(subInfo?.selectedFrequency ?? ""),
        auto_subscribe: true,
        enable_auto_debit: true,
      });
      const paymentLink =
        response.data?.data?.attributes?.payment?.authorization_url;
      if (!paymentLink) throw new Error("The payment link was not returned.");
      summaryRef.current?.dismiss();
      router.push({
        pathname: "/(protected)/(routes)/PaymentGateway",
        params: { paymentLink },
      });
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ??
          error.message ??
          "Unable to initialize payment.",
        { type: "danger" },
      );
    } finally {
      hideLoader();
    }
  };

  const openLegalDocument = async (url: string, title: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      toast.show(`Unable to open ${title}.`, { type: "danger" });
    }
  };

  const total = Number(cart?.attributes?.totalPrice ?? 0) + deliveryFee;
  const cartItems = cart?.attributes?.items ?? [];
  const baseItems = cartItems.filter((item) => item.item_type === "base");
  const addonItems = cartItems.filter((item) => item.item_type === "addon");
  const summarySections = useMemo<SummarySection[]>(() => {
    const sections: SummarySection[] = [];

    if (attributes?.prefilled_items?.length) {
      const data: SummaryItem[] = [];
      for (const item of attributes.prefilled_items) {
        data.push({
          type: "prefilled",
          id: item.product_id,
          name: item.name,
          weight: `${item.weight}${item.weight_unit}`,
          quantity: item.quantity,
        });
      }
      sections.push({
        type: "prefilled",
        title: "Mandatory cuts",
        data,
      });
    }

    if (baseItems.length) {
      const data: SummaryItem[] = [];
      baseItems.forEach((item, index) => {
        data.push({
          type: "base",
          id: `${item.productId?.id ?? "base"}-${index}`,
          name: item.productId?.name ?? "Item",
          weight: item.productId?.formattedWeight ?? "",
          quantity: item.quantity ?? 0,
        });
      });
      sections.push({
        type: "base",
        title: "Your custom picks",
        data,
      });
    }

    if (addonItems.length) {
      const data: SummaryItem[] = [];
      addonItems.forEach((item, index) => {
        data.push({
          type: "addon",
          id: `${item.productId?.id ?? "addon"}-${index}`,
          name: item.productId?.name ?? "Item",
          weight: item.productId?.formattedWeight ?? "",
          quantity: item.quantity ?? 1,
        });
      });
      sections.push({
        type: "addon",
        title: "Add-ons",
        data,
      });
    }

    return sections;
  }, [addonItems, attributes?.prefilled_items, baseItems]);

  return (
    <SafeAreaView className="bg-background" style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <StatusBar style="dark" />
        <View className="px-4">
          <SpaceBetweenHeader onBackPress={() => router.back()} showRight={false} />
        </View>

        {loadingData ? (
          <View className="flex-1 items-center justify-center px-8">
            <ActivityIndicator color="#218225" />
            <Text className="mt-2 font-mregular text-xs text-gray">
              Loading checkout...
            </Text>
          </View>
        ) : loadError ? (
          <View className="flex-1 items-center justify-center px-8">
            <View className="size-16 items-center justify-center rounded-full bg-red-50">
              <Ionicons name="cart-outline" size={30} color="#B52227" />
            </View>
            <Text className="mt-4 text-center font-mbold text-xl">
              Couldn't load checkout
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
              <FormField title="First name" required value={form.firstName} placeholder="Adebola" handleChangeText={(value) => updateForm("firstName", value, true)} onBlur={() => touch("firstName")} error={fieldError("firstName")} />
              <FormField title="Last name" required value={form.lastName} placeholder="Okonkwo" handleChangeText={(value) => updateForm("lastName", value, true)} onBlur={() => touch("lastName")} error={fieldError("lastName")} />
              <FormField title="Email" required value={form.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" handleChangeText={(value) => updateForm("email", value, true)} onBlur={() => touch("email")} error={fieldError("email")} />
              <FormField title="Phone Number" required value={form.phoneNumber} placeholder="08123456789" keyboardType="phone-pad" maxLength={11} handleChangeText={(value) => updateForm("phoneNumber", value, true)} onBlur={() => touch("phoneNumber")} error={fieldError("phoneNumber")} />
              <FormField title="State" required value={form.state} placeholder="Select your state" disabled onPress={() => statePickerRef.current?.present()} rightElement={<Ionicons name="chevron-down" size={22} color="#8E8E8E" />} error={fieldError("state")} />
              <FormField title="Delivery Area" required value={form.city} placeholder="Select your delivery area" disabled onPress={() => areaPickerRef.current?.present()} rightElement={<Ionicons name="chevron-down" size={22} color="#8E8E8E" />} error={fieldError("city")} />
              <View className="flex-row items-center gap-1">
                <Switch value={form.isDefaultAddress} onValueChange={(value) => updateForm("isDefaultAddress", value)} trackColor={{ false: "#D5D5D5", true: "#8FC895" }} thumbColor={form.isDefaultAddress ? "#218225" : "#FFFFFF"} />
                <Text className="font-mregular text-base">Set as default address</Text>
              </View>
              <FormField title="Street Address" required value={form.streetAddress} placeholder="12 Adeniyi Jones Avenue" handleChangeText={(value) => updateForm("streetAddress", value, true)} onBlur={() => touch("streetAddress")} error={fieldError("streetAddress")} />
              <FormField title="Apartment" value={form.apartment} placeholder="e.g First Floor, Room 10" handleChangeText={(value) => updateForm("apartment", value, true)} />
              <FormField title="Zip Code" optional value={form.zipCode} placeholder="102040" keyboardType="number-pad" maxLength={6} handleChangeText={(value) => updateForm("zipCode", value, true)} />

              <View>
                <Text className="font-msbold text-xl">Delivery Note <Text className="font-mregular text-sm text-gray">(Optional)</Text></Text>
                <TextArea value={form.deliveryNote} placeholder="Gate code, call instructions, or preferred drop-off note." handleChangeText={(value) => updateForm("deliveryNote", value)} maxLength={300} inputContainerStyles="mt-2" />
                <Text className="mt-2 text-right font-mregular text-xs text-gray">{300 - form.deliveryNote.length} / 300</Text>
              </View>

              <View className="rounded-2xl bg-white p-4">
                <Text className="font-mbold text-xl">Subscription Schedule Summary</Text>
                <SpaceBetween title="Frequency" value={subInfo?.selectedFrequency ?? "-"} containerStyles="mt-4" titleStyles="text-gray" />
                <Text className="mt-4 font-mregular text-xs leading-5 text-gray">
                  By continuing with your payment, you agree to our{" "}
                  <Text
                    accessibilityRole="link"
                    className="font-msbold text-green underline"
                    onPress={() =>
                      void openLegalDocument(termsUrl, "Terms of Use")
                    }
                  >
                    Terms of Use
                  </Text>{" "}
                  and{" "}
                  <Text
                    accessibilityRole="link"
                    className="font-msbold text-green underline"
                    onPress={() =>
                      void openLegalDocument(privacyUrl, "Privacy Policy")
                    }
                  >
                    Privacy Policy
                  </Text>
                  , you agree that one or more items in your cart is a deferred
                  or recurring purchase, you agree to purchase a continuous
                  subscription, and you agree that your payment method will
                  automatically be charged at the price and frequency listed on
                  this page until it ends or you cancel. Prices are subject to
                  change. All cancellations are subject to our cancellation
                  policy. Cancel your subscription through your account or by
                  emailing support@meatng.com.
                </Text>
              </View>
            </View>
          </ScrollView>
        )}

        {!loadingData && !loadError ? (
          <View className="px-4">
            <CustomButton title="Continue" handlePress={openSummary} disableButton={!cart} containerStyles="mb-1 mt-2 w-full" textStyles="text-white" />
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
      <StatePickerSheet ref={statePickerRef} selectedState={form.state} onSelect={(value) => { setForm((current) => ({ ...current, state: value, city: "" })); clearResolvedAddress(); statePickerRef.current?.dismiss(); }} />
      <AreaPickerSheet ref={areaPickerRef} state={form.state} selectedArea={form.city} onSelect={(value) => { updateForm("city", value, true); areaPickerRef.current?.dismiss(); }} />

      <CustomButtomSheet ref={summaryRef} snapPoints={summarySnapPoints} dynamicSizing={false} enablePenDown={false} scrollable>
        <View className="h-full">
          <Pressable onPress={() => summaryRef.current?.dismiss()} className="mb-3 size-12 items-center justify-center rounded-full bg-green-light">
            <Ionicons name="arrow-back" size={22} color="#218225" />
          </Pressable>
          <BottomSheetSectionList<SummaryItem, SummarySection>
            sections={summarySections}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={
              <View>
                <View className="mb-3">
                  <Text className="font-mbold text-2xl">Order Summary</Text>
                  <Text className="font-mregular text-sm text-gray">Confirm your subscription box and add-ons before payment.</Text>
                </View>
                <View className="h-4 rounded-t-2xl bg-white" />
              </View>
            }
            renderSectionHeader={({ section }) => (
              <View className="bg-white px-4">
                <View
                  className={`px-3 pt-3 ${
                    section.type === "prefilled"
                      ? "rounded-t-xl bg-green-lighter"
                      : section.type === "addon"
                        ? "mt-4 rounded-t-xl border-x border-t border-gray-200"
                        : attributes?.prefilled_items?.length
                          ? "mt-4"
                          : ""
                  }`}
                >
                  <Text
                    className={`font-msbold text-[10px] uppercase tracking-wider ${
                      section.type === "base" ? "text-green" : "text-gray"
                    }`}
                  >
                    {section.title}
                  </Text>
                </View>
              </View>
            )}
            renderItem={({ item }) => {
              if (item.type === "prefilled") {
                return (
                  <View className="bg-white px-4">
                    <View className="bg-green-lighter px-3 pt-2">
                      <SpaceBetween
                        title={item.name}
                        value={`${item.weight}${item.quantity > 1 ? ` · X (${item.quantity})` : ""}`}
                        titleStyles="flex-1 font-msbold text-xs"
                        valueStyles="font-mregular text-[10px] text-gray"
                      />
                    </View>
                  </View>
                );
              }

              return (
                <View className="bg-white px-4">
                  <View
                    className={`flex-row justify-between gap-3 px-3 pt-2 ${
                      item.type === "addon"
                        ? "items-start border-x border-gray-200"
                        : "items-center"
                    }`}
                  >
                    <View className="min-w-0 flex-1 flex-row items-center gap-2">
                      <Text className="shrink font-msbold text-xs">
                        {item.name}
                      </Text>
                      {item.type === "addon" || item.quantity > 1 ? (
                        <View
                          className={
                            item.type === "addon"
                              ? "rounded-full border border-gray-200 px-2 py-1"
                              : "rounded-full bg-green-light px-2 py-1"
                          }
                        >
                          <Text
                            className={`font-msbold text-[9px] ${
                              item.type === "base" ? "text-green" : ""
                            }`}
                          >
                            {item.quantity}x
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text className="font-mregular text-[10px] text-gray">
                      {item.weight}
                    </Text>
                  </View>
                </View>
              );
            }}
            renderSectionFooter={({ section }) =>
              section.type === "prefilled" ? (
                <View className="bg-white px-4">
                  <View className="h-3 rounded-b-xl bg-green-lighter" />
                </View>
              ) : section.type === "addon" ? (
                <View className="bg-white px-4">
                  <View className="h-3 rounded-b-xl border-x border-b border-gray-200" />
                </View>
              ) : null
            }
            ListFooterComponent={
              <View className="rounded-b-2xl bg-white px-4 pb-4">
              <View className="mt-4 gap-2">
                <SpaceBetween title="Plan" value={attributes?.name ?? "Subscription Plan"} titleStyles="text-gray" />
                <SpaceBetween title="Weight" value={`${attributes?.weight ?? 0}${attributes?.weight_unit ?? "kg"}`} titleStyles="text-gray" />
                <SpaceBetween title="Frequency" value={subInfo?.selectedFrequency ?? "-"} titleStyles="text-gray" />
              </View>

              <View className="mt-4 items-center rounded-xl border border-dashed border-gray-300 p-4">
                <Text className="font-mregular text-xs text-gray">
                  Need to adjust your selection?
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    summaryRef.current?.dismiss();
                    router.dismissTo(
                      subInfo?.source === "tab"
                        ? "/(protected)/(tabs)/Plans"
                        : "/(onboarding)/Plans",
                    );
                  }}
                  className="mt-2 rounded-lg border border-green px-4 py-3 active:bg-green-lighter"
                >
                  <Text className="font-msbold text-xs text-green">
                    Change Plan/Frequency
                  </Text>
                </Pressable>
              </View>

              <SpaceBetween
                title="Plan price"
                containerStyles="mt-4"
                value={displayCurrency(Number(cart?.attributes?.planUnitPrice ?? 0), "NGN")}
                titleStyles="text-gray"
              />
              {Number(cart?.attributes?.addonTotal ?? 0) > 0 ? (
                <SpaceBetween
                  title="Add-ons"
                  value={displayCurrency(Number(cart?.attributes?.addonTotal ?? 0), "NGN")}
                  containerStyles="mt-2"
                  titleStyles="text-gray"
                />
              ) : null}
              <View className="mt-2 flex-row items-center justify-between gap-3">
                <View className="flex-row items-center gap-1.5">
                  <Ionicons name="car-outline" size={15} color="#8E8E8E" />
                  <Text className="font-mregular text-sm text-gray">
                    Delivery Fee
                  </Text>
                </View>
                <Text className="font-msbold text-sm">
                  {deliveryFee
                    ? displayCurrency(deliveryFee, "NGN")
                    : "Select location"}
                </Text>
              </View>

              <View className="my-4 h-px bg-gray-200" />
              <SpaceBetween
                title="Total due now"
                value={displayCurrency(total, "NGN")}
                titleStyles="font-mbold text-base"
                valueStyles="font-msbold text-base text-green"
              />
              </View>
            }
          />
          <CustomButton title="Pay Now" handlePress={payNow} containerStyles="mb-2 mt-4 w-full" textStyles="text-white" />
        </View>
      </CustomButtomSheet>
    </SafeAreaView>
  );
};

export default Checkout;
