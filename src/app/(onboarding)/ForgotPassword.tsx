import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { axiosClient } from "@/globalApi";
import { hideLoader, showLoader, useIsLoading } from "@/store/LoaderStore";
import type { AuthEmailRouteParams } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .pipe(z.email({ error: "Enter a valid email address" })),
});

type ForgotPasswordForm = z.input<typeof forgotPasswordSchema>;
type ForgotPasswordField = keyof ForgotPasswordForm;

export default function ForgotPassword() {
  const params = useLocalSearchParams<AuthEmailRouteParams>();
  const toast = useToast();
  const isLoading = useIsLoading();
  const [form, setForm] = useState<ForgotPasswordForm>({
    email: params.email ?? "",
  });
  const [touched, setTouched] = useState<
    Partial<Record<ForgotPasswordField, boolean>>
  >({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const validation = forgotPasswordSchema.safeParse(form);
  const errors = validation.success
    ? {}
    : validation.error.issues.reduce<
        Partial<Record<ForgotPasswordField, string>>
      >((fieldErrors, issue) => {
        const field = issue.path[0] as ForgotPasswordField;
        fieldErrors[field] ??= issue.message;
        return fieldErrors;
      }, {});

  const fieldError = (field: ForgotPasswordField) =>
    touched[field] || hasSubmitted ? errors[field] : undefined;

  const updateField = (field: ForgotPasswordField, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const touchField = (field: ForgotPasswordField) =>
    setTouched((current) => ({ ...current, [field]: true }));

  const handleForgotEmail = async () => {
    setHasSubmitted(true);
    if (!validation.success || isLoading) return;

    try {
      showLoader();
      const response = await axiosClient.post("/auth/forgot-password", {
        email: validation.data.email,
      });

      toast.show(
        response.data?.data?.attributes?.message ??
          "Reset code sent to your email.",
        { type: "success" },
      );
      router.push({
        pathname: "/(onboarding)/ForgotPasswordOTP",
        params: { email: validation.data.email },
      });
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ??
          "Unable to send the reset code. Please try again.",
        { type: "danger" },
      );
    } finally {
      hideLoader();
    }
  };

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
            <Text className="font-mbold text-2xl">Forgot password?</Text>
            <Text className="mt-1 font-mregular text-base leading-6 text-gray">
              Enter the email address connected to your account and we'll send
              you a reset code.
            </Text>
          </View>

          <View className="mt-8">
            <FormField
              title="Email Address"
              value={form.email}
              placeholder="you@example.com"
              handleChangeText={(value) => updateField("email", value)}
              onBlur={() => touchField("email")}
              error={fieldError("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <CustomButton
              title="Send reset code"
              handlePress={handleForgotEmail}
              disableButton={isLoading}
              containerStyles="mt-8 w-full"
              textStyles="text-white"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
