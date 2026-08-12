import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import {
  SettingsHeader,
  SettingsScreenRoot,
} from "@/components/settings/SettingsShell";
import type { PersonalInformationForm } from "@/types/settings";
import { useState } from "react";
import { ScrollView } from "react-native";

export default function PersonalInformationScreen() {
  const [form, setForm] = useState<PersonalInformationForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const update = (key: keyof PersonalInformationForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <SettingsScreenRoot>
      <SettingsHeader
        title="Personal Information"
        subtitle="Update your personal information."
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-4 px-4 pb-5 pt-8"
      >
        <FormField
          title="First name"
          required
          value={form.firstName}
          placeholder="Adebola"
          handleChangeText={(value) => update("firstName", value)}
        />
        <FormField
          title="Last name"
          required
          value={form.lastName}
          placeholder="Okonkwo"
          handleChangeText={(value) => update("lastName", value)}
        />
        <FormField
          title="Email"
          required
          value={form.email}
          placeholder="you@example.com"
          handleChangeText={(value) => update("email", value)}
          keyboardType="email-address"
        />
        <FormField
          title="Phone Number"
          required
          value={form.phoneNumber}
          placeholder="08123456789"
          handleChangeText={(value) => update("phoneNumber", value)}
          keyboardType="phone-pad"
        />
        <CustomButton
          title="Save Changes"
          containerStyles="mt-10 w-full"
          textStyles="text-white"
        />
      </ScrollView>
    </SettingsScreenRoot>
  );
}
