import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import type { RegisterForm } from "@/types/auth";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
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

export default function Register() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    acceptedTerms: false,
  });

  function updateField<Key extends keyof RegisterForm>(
    field: Key,
    value: RegisterForm[Key],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
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
                otherStyles="flex-1"
                autoCapitalize="words"
                autoComplete="given-name"
              />
              <FormField
                title="Last Name"
                value={form.lastName}
                placeholder="Okonkwo"
                handleChangeText={(value) => updateField("lastName", value)}
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
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <FormField
              title="Phone Number"
              value={form.phoneNumber}
              placeholder="E.g 0813456789"
              handleChangeText={(value) => updateField("phoneNumber", value)}
              keyboardType="phone-pad"
              maxLength={11}
              autoComplete="tel"
            />
            <FormField
              title="Password"
              value={form.password}
              placeholder="Min. 8 characters"
              handleChangeText={(value) => updateField("password", value)}
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

            <View className="mt-1 flex-row items-start gap-3">
              <Checkbox
                value={form.acceptedTerms}
                onValueChange={(value) => updateField("acceptedTerms", value)}
                color={form.acceptedTerms ? "#218225" : undefined}
                style={{
                  width: 20,
                  height: 20,
                  marginTop: 2,
                  borderColor: "#218225",
                  borderWidth: 1,
                  borderRadius: 4,
                }}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  updateField("acceptedTerms", !form.acceptedTerms)
                }
                className="flex-1 active:opacity-80"
              >
                <Text className="font-mregular text-base">
                  I agree to the{" "}
                  <Text className="text-green">Terms & Conditions</Text> and{" "}
                  <Text className="text-green">Privacy Policy</Text>
                </Text>
              </Pressable>
            </View>

            <CustomButton
              title="Continue"
              handlePress={() =>
                router.push({
                  pathname: "/(onboarding)/RegisterOTP",
                  params: { email: form.email },
                })
              }
              // disableButton={!form.email.trim() || !form.acceptedTerms}
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
