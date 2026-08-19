import CustomButton from "@/components/CustomButton";
import CountDown from "@/components/CountDown";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import type { AuthOtpScreenProps } from "@/types";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthOtpScreen({
  title,
  description,
  email,
  buttonTitle = "Verify",
  numberOfDigits = 6,
  onConfirm,
  onResend,
}: AuthOtpScreenProps) {
  const [otp, setOtp] = useState("");
  const [resendAvailable, setResendAvailable] = useState(false);
  const [resending, setResending] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const handleResend = async () => {
    if (resending) return;

    try {
      setResending(true);
      await onResend?.();
      setOtp("");
      setInputKey((current) => current + 1);
      setResendAvailable(false);
    } catch {
      // The screen callback displays the request error.
    } finally {
      setResending(false);
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
            <Text className="font-mbold text-2xl">{title}</Text>
            <Text className="mt-1 font-mregular text-base text-gray">
              {description}
            </Text>
            {!!email && <Text className="font-msbold text-base">{email}</Text>}
          </View>

          <View className="mt-4">
            <Text className="mb-2 font-mmedium text-base">
              Verification code
            </Text>
            <OtpInput
              key={inputKey}
              numberOfDigits={numberOfDigits}
              autoFocus
              type="numeric"
              onTextChange={setOtp}
              theme={{
                containerStyle: {
                  gap: 8,
                  justifyContent: "flex-start",
                },
                pinCodeContainerStyle: {
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  backgroundColor: "#FFFFFF",
                },
                focusedPinCodeContainerStyle: {
                  borderColor: "#218225",
                },
                filledPinCodeContainerStyle: {
                  borderColor: "#218225",
                  backgroundColor: "#FFFFFF",
                },
                pinCodeTextStyle: {
                  color: "#292929",
                  fontFamily: "Montserrat-SemiBold",
                  fontSize: 18,
                },
                focusStickStyle: { backgroundColor: "#218225", height: 20 },
              }}
            />

            <View className="mt-4 flex-row flex-wrap">
              <Text className="font-mregular text-base text-gray">
                Didn't receive the code?{" "}
              </Text>
              {resendAvailable ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: resending }}
                  disabled={resending}
                  onPress={() => void handleResend()}
                  className="active:opacity-70"
                >
                  {resending ? (
                    <ActivityIndicator size="small" color="#218225" />
                  ) : (
                    <Text className="font-msbold text-base text-green">
                      Resend code
                    </Text>
                  )}
                </Pressable>
              ) : (
                <View className="flex-row items-center gap-1">
                  <Text className="font-mregular text-base text-gray">
                    Resend in
                  </Text>
                  <CountDown
                    key={inputKey}
                    initialSeconds={90}
                    onFinish={() => setResendAvailable(true)}
                  />
                </View>
              )}
            </View>

            <CustomButton
              title={buttonTitle}
              handlePress={() => onConfirm(otp)}
              disableButton={otp.length !== numberOfDigits}
              containerStyles="mt-6 w-full"
              textStyles="text-white"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
