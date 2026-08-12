import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import {
  SettingsHeader,
  SettingsScreenRoot,
} from "@/components/settings/SettingsShell";
import type { AddressForm, AddressFormScreenProps } from "@/types/settings";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function AddressFormScreen({ mode }: AddressFormScreenProps) {
  const [form, setForm] = useState<AddressForm>({
    label: "",
    firstName: "",
    lastName: "",
    email: "",
    addressType: "Shipping",
    streetAddress: "",
    area: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const update = <K extends keyof AddressForm>(key: K, value: AddressForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <SettingsScreenRoot>
      <SettingsHeader
        title={mode === "add" ? "Add New Addresses" : "Edit Address"}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-3 px-4 pb-5 pt-5"
        >
          <FormField
            title="Label"
            value={form.label}
            placeholder="Home"
            handleChangeText={(value) => update("label", value)}
          />
          <FormField
            value={form.firstName}
            placeholder="Adebola"
            handleChangeText={(value) => update("firstName", value)}
          />
          <FormField
            value={form.lastName}
            placeholder="Okonkwo"
            handleChangeText={(value) => update("lastName", value)}
          />
          <FormField
            value={form.email}
            placeholder="you@example.com"
            handleChangeText={(value) => update("email", value)}
            keyboardType="email-address"
          />
          <Text className="mt-2 font-mregular text-base">Address Type</Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => update("addressType", "Shipping")}
              className={`h-13 flex-1 items-center justify-center rounded-lg border ${form.addressType === "Shipping" ? "border-green bg-green" : "border-gray-300 bg-white"}`}
            >
              <Text
                className={`font-mregular text-base ${form.addressType === "Shipping" ? "text-white" : "text-gray"}`}
              >
                Shipping
              </Text>
            </Pressable>
            <Pressable
              onPress={() => update("addressType", "Billing")}
              className={`h-13 flex-1 items-center justify-center rounded-lg border ${form.addressType === "Billing" ? "border-green bg-green" : "border-gray-300 bg-white"}`}
            >
              <Text
                className={`font-mregular text-base ${form.addressType === "Billing" ? "text-white" : "text-gray"}`}
              >
                Billing
              </Text>
            </Pressable>
          </View>
          <FormField
            title="Street Address"
            value={form.streetAddress}
            placeholder="No. 41 Jabi Road Off Alkali Road"
            handleChangeText={(value) => update("streetAddress", value)}
            otherStyles="mt-2"
          />
          <FormField
            value={form.area}
            placeholder="Abraham Adesanya"
            handleChangeText={(value) => update("area", value)}
          />
          <FormField
            value={form.state}
            placeholder="Lagos"
            handleChangeText={(value) => update("state", value)}
          />
          <FormField
            value={form.country}
            placeholder="Nigeria"
            handleChangeText={(value) => update("country", value)}
          />
          <FormField
            value={form.zipCode}
            placeholder="900105"
            handleChangeText={(value) => update("zipCode", value)}
            keyboardType="number-pad"
          />
          <CustomButton
            title={mode === "add" ? "Add Address" : "Update Address"}
            containerStyles="mt-8 w-full"
            textStyles="text-white"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SettingsScreenRoot>
  );
}
