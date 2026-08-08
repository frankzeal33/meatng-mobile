import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { router } from "expo-router";
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

export default function NewPassword() {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const validPassword =
    form.password.length >= 8 && form.password === form.confirmPassword;

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
              isPassword
              autoCapitalize="none"
              autoComplete="new-password"
            />

            <CustomButton
              title="Reset password"
              handlePress={() => router.replace("/(onboarding)/Login")}
              disableButton={!validPassword}
              containerStyles="mt-3 w-full"
              textStyles="text-white"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
