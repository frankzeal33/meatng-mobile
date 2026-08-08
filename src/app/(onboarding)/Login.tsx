import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
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

export default function Login() {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ email: "", password: "" });

  function updateField(field: keyof typeof form, value: string) {
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
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingBottom: 28,
          }}
        >
          <SpaceBetweenHeader
            onBackPress={() => router.back()}
            showRight={false}
          />

          <View className="mt-2">
            <Text className="font-mbold text-2xl">Welcome back!</Text>
            <Text className="font-mregular text-base text-gray">
              Sign in to MeatNG. Access your delivery schedule, plan controls,
              and order history.
            </Text>
          </View>

          <View className="mt-4 gap-5">
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
              title="Password"
              value={form.password}
              placeholder="Min. 8 characters"
              handleChangeText={(value) => updateField("password", value)}
              isPassword
              autoCapitalize="none"
              autoComplete="current-password"
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/(onboarding)/ForgotPassword",
                params: { email: form.email },
              })
            }
            className="mt-6 self-end active:opacity-70"
          >
            <Text className="font-msbold text-base text-green">
              Forgot Password?
            </Text>
          </Pressable>

          <CustomButton
            title="Login"
            handlePress={() => {
              router.push("/(protected)/(tabs)/Home");
            }}
            containerStyles="mt-6"
            textStyles="text-white"
          />

          <View
            className="mt-4 flex-row items-center justify-center"
            style={{ paddingBottom: insets.bottom }}
          >
            <Text className="font-mregular text-base">Not a member yet? </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(onboarding)/Register")}
              className="active:opacity-70"
            >
              <Text className="font-msbold text-base text-green">Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
