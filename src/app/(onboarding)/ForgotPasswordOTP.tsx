import AuthOtpScreen from "@/components/AuthOtpScreen";
import { router, useLocalSearchParams } from "expo-router";

export default function ForgotPasswordOTP() {
  const params = useLocalSearchParams<AuthEmailRouteParams>();
  const email = params.email ?? "";

  return (
    <AuthOtpScreen
      title="Check your email"
      description="Enter the 4-digit reset code sent to"
      email={email || "your email address"}
      buttonTitle="Verify code"
      onConfirm={() =>
        router.push({
          pathname: "/(onboarding)/NewPassword",
          params: { email },
        })
      }
    />
  );
}
import type { AuthEmailRouteParams } from "@/types/onboarding";
