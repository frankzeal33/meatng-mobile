import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import {
  SettingsHeader,
  SettingsScreenRoot,
} from "@/components/settings/SettingsShell";
import { axiosClient } from "@/globalApi";
import type { ChangePasswordForm } from "@/types";
import { useState } from "react";
import { ScrollView } from "react-native";
import { useToast } from "react-native-toast-notifications";
import z from "zod";
import {
  hideLoader,
  showLoader,
  useIsLoading,
} from "@/store/LoaderStore";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(
        /[A-Z]/,
        "New password must contain at least one uppercase letter",
      )
      .regex(
        /[a-z]/,
        "New password must contain at least one lowercase letter",
      )
      .regex(/[0-9]/, "New password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "New password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ChangePasswordScreen = () => {
  const toast = useToast();
  const isLoading = useIsLoading();
  const [form, setForm] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof ChangePasswordForm, boolean>>
  >({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const validation = changePasswordSchema.safeParse(form);
  const errors = validation.success
    ? {}
    : validation.error.issues.reduce<
        Partial<Record<keyof ChangePasswordForm, string>>
      >((fieldErrors, issue) => {
        const field = issue.path[0] as keyof ChangePasswordForm;
        fieldErrors[field] ??= issue.message;
        return fieldErrors;
      }, {});

  const fieldError = (field: keyof ChangePasswordForm) =>
    touched[field] || hasSubmitted ? errors[field] : undefined;

  const touchField = (field: keyof ChangePasswordForm) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const updateField = (field: keyof ChangePasswordForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleChangePassword = async () => {
    setHasSubmitted(true);
    if (!validation.success || isLoading) return;

    try {
      showLoader();
      const response = await axiosClient.patch(
        "/auth/change-password",
        validation.data,
      );

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTouched({});
      setHasSubmitted(false);
      toast.show("Password updated successfully.", {
        type: "success",
      });
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ?? "Unable to update your password.",
        { type: "danger" },
      );
    } finally {
      hideLoader();
    }
  };

  return (
    <SettingsScreenRoot>
      <SettingsHeader title="Change Password" subtitle="Update your password." />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-4 px-4 pb-5 pt-8"
      >
        <FormField
          title="Current Password"
          required
          value={form.currentPassword}
          placeholder="Enter current password"
          handleChangeText={(value) =>
            updateField("currentPassword", value)
          }
          onBlur={() => touchField("currentPassword")}
          error={fieldError("currentPassword")}
          isPassword
          autoCapitalize="none"
          autoComplete="current-password"
        />
        <FormField
          title="New Password"
          required
          value={form.newPassword}
          placeholder="Enter new password"
          handleChangeText={(value) => updateField("newPassword", value)}
          onBlur={() => touchField("newPassword")}
          error={fieldError("newPassword")}
          isPassword
          autoCapitalize="none"
          autoComplete="new-password"
        />
        <FormField
          title="Confirm Password"
          required
          value={form.confirmPassword}
          placeholder="Confirm password"
          handleChangeText={(value) =>
            updateField("confirmPassword", value)
          }
          onBlur={() => touchField("confirmPassword")}
          error={fieldError("confirmPassword")}
          isPassword
          autoCapitalize="none"
          autoComplete="new-password"
        />
        <CustomButton
          title={isLoading ? "Updating..." : "Change Password"}
          handlePress={handleChangePassword}
          containerStyles="mt-6 w-full"
          textStyles="text-white"
          disableButton={isLoading}
        />
      </ScrollView>
    </SettingsScreenRoot>
  );
};

export default ChangePasswordScreen;
