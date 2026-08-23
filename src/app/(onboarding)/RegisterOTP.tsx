import AuthOtpScreen from "@/components/AuthOtpScreen";
import { axiosClient } from "@/globalApi";
import { hideLoader, showLoader } from "@/store/LoaderStore";
import type { AuthEmailRouteParams } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { useToast } from "react-native-toast-notifications";

export default function RegisterOTP() {
  const params = useLocalSearchParams<AuthEmailRouteParams>();
  const toast = useToast();
  const email = params.email ?? "";

  const handleConfirm = async (otp: string) => {
    if (!email) {
      toast.show("Email address is missing. Please go back.", {
        type: "danger",
      });
      return false;
    }

    try {
      showLoader();
      const response = await axiosClient.post("/auth/verify-email-otp", {
        email,
        otp,
      });

      toast.show(
        response.data?.meta?.message ??
          response.data?.data?.attributes?.message ??
          "Email verified successfully.",
        { type: "success" },
      );
      router.replace("/(onboarding)/Login");
      return true;
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ??
          "Unable to verify the code. Please try again.",
        { type: "danger" },
      );
      return false;
    } finally {
      hideLoader();
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.show("Email address is missing. Please go back.", {
        type: "danger",
      });
      throw new Error("Email address is missing");
    }

    try {
      const response = await axiosClient.post("/auth/send-email-otp", {
        email,
      });

      toast.show(
        response.data?.meta?.message ??
          response.data?.data?.attributes?.message ??
          "Verification code resent.",
        { type: "success" },
      );
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ??
          "Unable to resend the verification code.",
        { type: "danger" },
      );
      throw error;
    }
  };

  return (
    <AuthOtpScreen
      title="Verify your email"
      description="Enter the 6-digit verification code sent to"
      email={email || "your email address"}
      buttonTitle="Confirm"
      numberOfDigits={6}
      onConfirm={handleConfirm}
      onResend={handleResend}
    />
  );
}
