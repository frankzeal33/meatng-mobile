import AuthOtpScreen from "@/components/AuthOtpScreen";
import { axiosClient } from "@/globalApi";
import { hideLoader, showLoader } from "@/store/LoaderStore";
import type { AuthEmailRouteParams } from "@/types";
import { router, useLocalSearchParams } from "expo-router";
import { useToast } from "react-native-toast-notifications";

export default function ForgotPasswordOTP() {
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
      const response = await axiosClient.post(
        "/auth/verify-password-reset-otp",
        { email, otp },
      );
      const attributes = response.data?.data?.attributes;
      const requestId = attributes?.requestId;
      const token = attributes?.token;

      if (!requestId || !token) {
        toast.show("The password reset response is incomplete. Try again.", {
          type: "danger",
        });
        return false;
      }

      toast.show(response.data?.meta?.message ??
          "Reset code verified.",
        { type: "success" },
      );
      router.push({
        pathname: "/(onboarding)/NewPassword",
        params: { requestId, token },
      });
      return true;
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ??
          "Unable to verify the reset code. Please try again.",
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
      const response = await axiosClient.post("/auth/forgot-password", {
        email,
      });

      toast.show(
        response.data?.data?.attributes?.message ??
          "Reset code sent to your email.",
        { type: "success" },
      );
      
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ??
          "Unable to resend the reset code.",
        { type: "danger" },
      );
      throw error;
    }
  };

  return (
    <AuthOtpScreen
      title="Check your email"
      description="Enter the 6-digit reset code sent to"
      email={email || "your email address"}
      numberOfDigits={6}
      buttonTitle="Verify code"
      onConfirm={handleConfirm}
      onResend={handleResend}
    />
  );
}
