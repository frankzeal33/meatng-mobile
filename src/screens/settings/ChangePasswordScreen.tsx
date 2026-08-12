import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import {
  SettingsHeader,
  SettingsScreenRoot,
} from "@/components/settings/SettingsShell";
import type { ChangePasswordForm } from "@/types/settings";
import { useState } from "react";
import { ScrollView } from "react-native";

export default function ChangePasswordScreen() {
  const [form, setForm] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const update = (key: keyof ChangePasswordForm, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <SettingsScreenRoot>
      <SettingsHeader
        title="Change Password"
        subtitle="Update your password."
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-4 px-4 pb-5 pt-8"
      >
        <FormField
          title="Current Password"
          value={form.currentPassword}
          placeholder="Enter current password"
          handleChangeText={(value) => update("currentPassword", value)}
          isPassword
        />
        <FormField
          title="New Password"
          value={form.newPassword}
          placeholder="Enter new password"
          handleChangeText={(value) => update("newPassword", value)}
          isPassword
        />
        <FormField
          title="Confirm Password"
          value={form.confirmPassword}
          placeholder="Confirm password"
          handleChangeText={(value) => update("confirmPassword", value)}
          isPassword
        />
        <CustomButton
          title="Confirm Password"
          containerStyles="mt-10 w-full"
          textStyles="text-white"
        />
      </ScrollView>
    </SettingsScreenRoot>
  );
}
