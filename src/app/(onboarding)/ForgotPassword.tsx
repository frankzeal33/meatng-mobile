import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
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

export default function ForgotPassword() {
  const params = useLocalSearchParams<AuthEmailRouteParams>();
  const [form, setForm] = useState({ email: params.email ?? "" });

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
              handleChangeText={(email) => setForm({ email })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <CustomButton
              title="Send reset code"
              handlePress={() =>
                router.push({
                  pathname: "/(onboarding)/ForgotPasswordOTP",
                  params: { email: form.email },
                })
              }
              disableButton={!form.email.trim()}
              containerStyles="mt-8 w-full"
              textStyles="text-white"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
import type { AuthEmailRouteParams } from "@/types";
