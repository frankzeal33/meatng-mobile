import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { axiosClient } from "@/globalApi";
import {
  hideLoader,
  showLoader,
  useIsLoading,
} from "@/store/LoaderStore";
import type { RegisterForm } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";
import z from "zod";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
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
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .pipe(z.email({ error: "Enter a valid email address" })),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Register() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const isLoading = useIsLoading();
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof RegisterForm, boolean>>
  >({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const validation = registerSchema.safeParse(form);
  const errors = validation.success
    ? {}
    : validation.error.issues.reduce<Partial<Record<keyof RegisterForm, string>>>(
        (fieldErrors, issue) => {
          const field = issue.path[0] as keyof RegisterForm;
          fieldErrors[field] ??= issue.message;
          return fieldErrors;
        },
        {},
      );

  function fieldError(field: keyof RegisterForm) {
    return touched[field] || hasSubmitted ? errors[field] : undefined;
  }

  function touchField(field: keyof RegisterForm) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function updateField<Key extends keyof RegisterForm>(
    field: Key,
    value: RegisterForm[Key],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const handleContinue = async () => {
    setHasSubmitted(true);
    if (!validation.success || isLoading) return;

    try {
      showLoader();

      const referralCode = form.referralCode.trim();
      const payload = {
        ...validation.data,
        ...(referralCode ? { referralCode } : {}),
      };

      const result = await axiosClient.post("/auth/signup",payload);

      const email = result.data?.data?.attributes?.user?.email ?? validation.data.email;

      toast.show(result.data?.meta?.message ?? "Verification code sent.", {
        type: "success",
      });

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        referralCode: ""
      });
      setTouched({});
      setHasSubmitted(false);

      router.push({
        pathname: "/(onboarding)/RegisterOTP",
        params: { email },
      });

    } catch (error: any) {
      const message = error.response?.data?.message ?? "An error occurred. Please try again.";

      toast.show(message,{
        type: "danger"
      });

      if (message === "User already exists") {
        router.push("/(onboarding)/Login");
      }

    } finally {
      hideLoader();
    }
  }

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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
        >
          <SpaceBetweenHeader
            onBackPress={() => router.back()}
            showRight={false}
          />

          <View className="mt-2">
            <Text className="font-mbold text-2xl">
              Create your member account
            </Text>
            <Text className="font-mregular text-base text-gray">
              Finish account setup, then continue to checkout to activate
              membership.
            </Text>
          </View>

          <View className="mt-4 gap-4" style={{ paddingBottom: insets.bottom }}>
            <View className="flex-row gap-3">
              <FormField
                title="First Name"
                value={form.firstName}
                placeholder="Adebola"
                handleChangeText={(value) => updateField("firstName", value)}
                onBlur={() => touchField("firstName")}
                error={fieldError("firstName")}
                otherStyles="flex-1"
                autoCapitalize="words"
                autoComplete="given-name"
              />
              <FormField
                title="Last Name"
                value={form.lastName}
                placeholder="Okonkwo"
                handleChangeText={(value) => updateField("lastName", value)}
                onBlur={() => touchField("lastName")}
                error={fieldError("lastName")}
                otherStyles="flex-1"
                autoCapitalize="words"
                autoComplete="family-name"
              />
            </View>
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
            <FormField
              title="Phone Number"
              value={form.phone}
              placeholder="E.g 0813456789"
              handleChangeText={(value) => updateField("phone", value)}
              onBlur={() => touchField("phone")}
              error={fieldError("phone")}
              keyboardType="phone-pad"
              maxLength={11}
              autoComplete="tel"
            />
            <FormField
              title="Password"
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
              title="Confirm Password"
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
            <FormField
              title="Referral Code"
              optional
              value={form.referralCode}
              placeholder="Enter referral code"
              handleChangeText={(value) => updateField("referralCode", value)}
              labelStyle="text-[#292929]"
            />

            <CustomButton
              title="Continue"
              containerStyles="mt-3"
              handlePress={handleContinue}
              disableButton={isLoading}
              textStyles="text-white"
              rightElement={
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              }
            />

            <View className="flex-row items-center justify-center">
              <Text className="font-mregular text-base">
                Already have an account?{" "}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push("/(onboarding)/Login")}
                className="active:opacity-70"
              >
                <Text className="font-msbold text-base text-green">Login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
