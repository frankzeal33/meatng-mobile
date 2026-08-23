import CustomButton from "@/components/CustomButton";
import {
  AreaPickerSheet,
  StatePickerSheet,
} from "@/components/DeliveryLocationSheets";
import FormField from "@/components/FormField";
import RetryButton from "@/components/RetryButton";
import {
  SettingsHeader,
  SettingsScreenRoot,
} from "@/components/settings/SettingsShell";
import { getDeliveryState } from "@/constants/data";
import { axiosClient } from "@/globalApi";
import type {
  AddressForm,
  AddressFormScreenProps,
  ApiAddress,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { useToast } from "react-native-toast-notifications";
import z from "zod";
import {
  hideLoader,
  showLoader,
  useIsLoading,
} from "@/store/LoaderStore";

const emptyAddressForm: AddressForm = {
  label: "",
  addressType: "shipping",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  streetAddress: "",
  apartmentSuite: "",
  area: "",
  state: "",
  country: "Nigeria",
  zipCode: "",
  isDefault: false,
};

const addressSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  addressType: z.enum(["shipping", "billing"]),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .pipe(z.email({ error: "Enter a valid email address" })),
  phone: z
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
  streetAddress: z.string().trim().min(1, "Street address is required"),
  apartmentSuite: z.string().trim().optional(),
  area: z.string().trim().min(1, "Delivery area is required"),
  state: z.string().trim().min(1, "State is required"),
  zipCode: z.string().trim().optional(),
  country: z.string().trim().min(1, "Country is required"),
  isDefault: z.boolean(),
});

const mapAddressToForm = (address: ApiAddress): AddressForm => {
  const attributes = address.attributes ?? {};
  const state = getDeliveryState(attributes.state ?? "")?.name;

  return {
    label: attributes.label ?? "",
    addressType:
      attributes.address_type?.toLowerCase() === "billing"
        ? "billing"
        : "shipping",
    firstName: attributes.first_name ?? "",
    lastName: attributes.last_name ?? "",
    email: attributes.email ?? "",
    phone: attributes.phone ?? "",
    streetAddress: attributes.street_address ?? "",
    apartmentSuite: attributes.apartment_suite ?? "",
    area: attributes.city ?? "",
    state: state ?? attributes.state ?? "",
    zipCode: attributes.zip_code ?? "",
    country: attributes.country ?? "Nigeria",
    isDefault: attributes.is_default ?? false,
  };
};

const AddressFormScreen = ({ mode, addressId }: AddressFormScreenProps) => {
  const toast = useToast();
  const isLoading = useIsLoading();
  const statePickerRef = useRef<BottomSheetModal>(null);
  const areaPickerRef = useRef<BottomSheetModal>(null);
  const [form, setForm] = useState<AddressForm>(emptyAddressForm);
  const [touched, setTouched] = useState<
    Partial<Record<keyof AddressForm, boolean>>
  >({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === "edit");
  const [loadError, setLoadError] = useState<string | null>(null);

  const validation = addressSchema.safeParse(form);
  const errors = validation.success
    ? {}
    : validation.error.issues.reduce<
        Partial<Record<keyof AddressForm, string>>
      >((fieldErrors, issue) => {
        const field = issue.path[0] as keyof AddressForm;
        fieldErrors[field] ??= issue.message;
        return fieldErrors;
      }, {});

  const fieldError = (field: keyof AddressForm) =>
    touched[field] || hasSubmitted ? errors[field] : undefined;

  const touchField = (field: keyof AddressForm) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const update = <Key extends keyof AddressForm>(
    key: Key,
    value: AddressForm[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const fetchAddress = useCallback(async () => {
    if (mode !== "edit") return;
    if (!addressId) {
      setLoadError("This address could not be found.");
      setInitialLoading(false);
      return;
    }

    try {
      setInitialLoading(true);
      setLoadError(null);
      const response = await axiosClient.get("/addresses");
      const addresses: ApiAddress[] = response.data?.data ?? [];
      const address = addresses.find((item) => String(item.id) === addressId);

      if (!address) {
        setLoadError("This address could not be found.");
        return;
      }

      setForm(mapAddressToForm(address));
    } catch (error: any) {
      const message =
        error.response?.data?.message ?? "Failed to load this address.";
      setLoadError(message);
      toast.show(message, { type: "danger" });
    } finally {
      setInitialLoading(false);
    }
  }, [addressId, mode, toast]);

  useEffect(() => {
    void fetchAddress();
  }, [fetchAddress]);

  const selectState = (state: string) => {
    setForm((current) => ({ ...current, state, area: "" }));
    statePickerRef.current?.dismiss();
  };

  const selectArea = (area: string) => {
    update("area", area);
    areaPickerRef.current?.dismiss();
  };

  const saveAddress = async () => {
    setHasSubmitted(true);
    if (!validation.success || isLoading) return;

    const data = validation.data;
    const payload = {
      address_type: data.addressType,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      label: data.label,
      street_address: data.streetAddress,
      apartment_suite: data.apartmentSuite ?? "",
      city: data.area,
      state: data.state,
      zip_code: data.zipCode ?? "",
      country: data.country,
      is_default: data.isDefault,
    };

    try {
      showLoader();
      if (mode === "edit") {
        if (!addressId) {
          toast.show("This address could not be found.", { type: "danger" });
          return;
        }
        await axiosClient.patch(`/addresses/${addressId}`, payload);
        toast.show("Address updated successfully.", { type: "success" });
      } else {
        await axiosClient.post("/addresses", payload);
        toast.show("Address created successfully.", { type: "success" });
      }

      router.back();
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ?? "Failed to save address.",
        { type: "danger" },
      );
    } finally {
      hideLoader();
    }
  };

  return (
    <SettingsScreenRoot>
      <SettingsHeader
        title={mode === "add" ? "Add New Address" : "Edit Address"}
      />
      {initialLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#218225" />
          <Text className="mt-2 font-mregular text-xs text-gray">
            Loading address...
          </Text>
        </View>
      ) : loadError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-mregular text-sm text-gray">
            {loadError}
          </Text>
          <RetryButton
            onPress={() => void fetchAddress()}
            containerStyles="mt-4"
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-3 px-4 pb-5 pt-5"
          >
            <FormField
              title="Label"
              required
              value={form.label}
              placeholder="Home"
              handleChangeText={(value) => update("label", value)}
              onBlur={() => touchField("label")}
              error={fieldError("label")}
            />

            <Text className="mt-2 font-mregular text-base">Address Type</Text>
            <View className="flex-row gap-2">
              {(["shipping", "billing"] as const).map((type) => (
                <Pressable
                  key={type}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: form.addressType === type }}
                  onPress={() => update("addressType", type)}
                  className={`h-13 flex-1 items-center justify-center rounded-lg border ${form.addressType === type ? "border-green bg-green" : "border-gray-300 bg-white"}`}
                >
                  <Text
                    className={`font-mregular text-base capitalize ${form.addressType === type ? "text-white" : "text-gray"}`}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>

            <FormField
              title="First Name"
              required
              value={form.firstName}
              placeholder="Adebola"
              handleChangeText={(value) => update("firstName", value)}
              onBlur={() => touchField("firstName")}
              error={fieldError("firstName")}
              autoCapitalize="words"
              autoComplete="given-name"
            />
            <FormField
              title="Last Name"
              required
              value={form.lastName}
              placeholder="Okonkwo"
              handleChangeText={(value) => update("lastName", value)}
              onBlur={() => touchField("lastName")}
              error={fieldError("lastName")}
              autoCapitalize="words"
              autoComplete="family-name"
            />
            <FormField
              title="Email Address"
              required
              value={form.email}
              placeholder="you@example.com"
              handleChangeText={(value) => update("email", value)}
              onBlur={() => touchField("email")}
              error={fieldError("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <FormField
              title="Phone Number"
              required
              value={form.phone}
              placeholder="08123456789"
              handleChangeText={(value) => update("phone", value)}
              onBlur={() => touchField("phone")}
              error={fieldError("phone")}
              keyboardType="phone-pad"
              maxLength={11}
              autoComplete="tel"
            />
            <FormField
              title="State"
              required
              value={form.state}
              placeholder="Select your state"
              disabled
              onPress={() => statePickerRef.current?.present()}
              error={fieldError("state")}
              rightElement={
                <Ionicons name="chevron-down" size={22} color="#8E8E8E" />
              }
              otherStyles="mt-2"
            />
            <FormField
              title="Delivery Area"
              required
              value={form.area}
              placeholder="Select your delivery area"
              disabled
              onPress={() =>
                form.state
                  ? areaPickerRef.current?.present()
                  : statePickerRef.current?.present()
              }
              error={fieldError("area")}
              rightElement={
                <Ionicons name="chevron-down" size={22} color="#8E8E8E" />
              }
            />
            <FormField
              title="Street Address"
              required
              value={form.streetAddress}
              placeholder="No. 41 Jabi Road Off Alkali Road"
              handleChangeText={(value) => update("streetAddress", value)}
              onBlur={() => touchField("streetAddress")}
              error={fieldError("streetAddress")}
            />
            <FormField
              title="Apartment / Suite"
              optional
              value={form.apartmentSuite}
              placeholder="Apartment, suite or unit"
              handleChangeText={(value) => update("apartmentSuite", value)}
            />
            <FormField
              title="Country"
              required
              value={form.country}
              placeholder="Nigeria"
              handleChangeText={(value) => update("country", value)}
              onBlur={() => touchField("country")}
              error={fieldError("country")}
              autoCapitalize="words"
            />
            <FormField
              title="ZIP Code"
              optional
              value={form.zipCode}
              placeholder="900105"
              handleChangeText={(value) => update("zipCode", value)}
              keyboardType="number-pad"
            />

            <View className="mt-2 flex-row items-center justify-between rounded-lg bg-white px-4 py-3">
              <View className="mr-4 flex-1">
                <Text className="font-mmedium text-base">Default Address</Text>
                <Text className="font-mregular text-xs text-gray">
                  Use this address by default during checkout.
                </Text>
              </View>
              <Switch
                value={form.isDefault}
                onValueChange={(value) => update("isDefault", value)}
                trackColor={{ false: "#D1D5DB", true: "#A7D7AA" }}
                thumbColor={form.isDefault ? "#218225" : "#FFFFFF"}
              />
            </View>

            <CustomButton
              title={
                isLoading
                  ? "Saving..."
                  : mode === "add"
                    ? "Add Address"
                    : "Update Address"
              }
              handlePress={saveAddress}
              containerStyles="mt-6 w-full"
              textStyles="text-white"
              disableButton={isLoading}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <StatePickerSheet
        ref={statePickerRef}
        selectedState={form.state}
        onSelect={selectState}
      />
      <AreaPickerSheet
        ref={areaPickerRef}
        state={form.state}
        selectedArea={form.area}
        onSelect={selectArea}
      />
    </SettingsScreenRoot>
  );
};

export default AddressFormScreen;
