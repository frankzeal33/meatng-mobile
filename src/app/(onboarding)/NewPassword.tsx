import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { axiosClient } from "@/globalApi";
import { hideLoader, showLoader, useIsLoading } from "@/store/LoaderStore";
import type { PasswordResetRouteParams } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";
import z from "zod";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.input<typeof resetPasswordSchema>;
type ResetPasswordField = keyof ResetPasswordForm;

export default function NewPassword() {
  const params = useLocalSearchParams<PasswordResetRouteParams>();
  const toast = useToast();
  const isLoading = useIsLoading();
  const requestId = params.requestId ?? "";
  const token = params.token ?? "";
  const resetCredentialsMissing = !requestId || !token;
  const [form, setForm] = useState<ResetPasswordForm>({
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<
    Partial<Record<ResetPasswordField, boolean>>
  >({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const validation = resetPasswordSchema.safeParse(form);
  const errors = validation.success
    ? {}
    : validation.error.issues.reduce<
        Partial<Record<ResetPasswordField, string>>
      >((fieldErrors, issue) => {
        const field = issue.path[0] as ResetPasswordField;
        fieldErrors[field] ??= issue.message;
        return fieldErrors;
      }, {});

  const fieldError = (field: ResetPasswordField) =>
    touched[field] || hasSubmitted ? errors[field] : undefined;

  const updateField = (field: ResetPasswordField, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const touchField = (field: ResetPasswordField) =>
    setTouched((current) => ({ ...current, [field]: true }));

  useEffect(() => {
    if (!resetCredentialsMissing) return;

    toast.show(
      "Your password reset request is invalid or expired. Please try again.",
      { type: "danger" },
    );
    router.replace("/(onboarding)/ForgotPassword");
  }, [resetCredentialsMissing, toast]);

  const handleResetPassword = async () => {
    setHasSubmitted(true);
    if (!validation.success || isLoading || resetCredentialsMissing) return;

    try {
      showLoader();
      const response = await axiosClient.post(
        `/auth/reset-password?requestId=${encodeURIComponent(requestId)}&token=${encodeURIComponent(token)}`,
        validation.data,
      );

      toast.show(
        response.data?.data?.attributes?.message ??
          response.data?.meta?.message ??
          "Password reset successfully.",
        { type: "success" },
      );
      router.replace("/(onboarding)/Login");
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ??
          "Unable to reset your password. Please request a new code.",
        { type: "danger" },
      );
    } finally {
      hideLoader();
    }
  };

  if (resetCredentialsMissing) return null;

  return (
    <SafeAreaView className="bg-background" edges={["top"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <StatusBar style="dark" />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingBottom: 32,
          }}
        >
          <SpaceBetweenHeader
            onBackPress={() => router.back()}
            showRight={false}
          />

          <View className="mt-2">
            <Text className="font-mbold text-2xl">Create new password</Text>
            <Text className="mt-1 font-mregular text-base leading-6 text-gray">
              Your new password must be different from your previously used
              password.
            </Text>
          </View>

          <View className="mt-6 gap-5">
            <FormField
              title="New Password"
              value={form.password}
              placeholder="Min. 8 characters"
              handleChangeText={(value) => updateField("password", value)}
              onBlur={() => touchField("password")}
              error={fieldError("password")}
              isPassword
              autoCapitalize="none"
              autoComplete="new-password"
            />
            <FormField
              title="Confirm New Password"
              value={form.confirmPassword}
              placeholder="Confirm your password"
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
              title="Reset password"
              handlePress={handleResetPassword}
              disableButton={isLoading}
              containerStyles="mt-3 w-full"
              textStyles="text-white"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
