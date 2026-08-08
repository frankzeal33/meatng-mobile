import AuthOtpScreen from "@/components/AuthOtpScreen";
import { router, useLocalSearchParams } from "expo-router";

export default function RegisterOTP() {
  const params = useLocalSearchParams<AuthEmailRouteParams>();

  return (
    <AuthOtpScreen
      title="Verify your email"
      description="Enter the 4-digit verification code sent to"
      email={params.email ?? "your email address"}
      buttonTitle="Confirm"
      onConfirm={() => router.replace("/(onboarding)/Login")}
    />
  );
}
import type { AuthEmailRouteParams } from "@/types/onboarding";
