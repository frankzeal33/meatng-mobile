import {
  SettingsHeader,
  SettingsScreenRoot,
} from "@/components/settings/SettingsShell";
import { axiosClient } from "@/globalApi";
import { useAddonStore } from "@/store/addonStore";
import { useCartStore } from "@/store/cartStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";

type VerificationState = {
  message: string;
  status: "idle" | "checking" | "success" | "error";
};

const PaymentGatewayScreen = () => {

  const { paymentLink } = useLocalSearchParams<{ paymentLink?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [verification, setVerification] = useState<VerificationState>({
    message: "",
    status: "idle",
  });
  const verifyingReference = useRef<string | null>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    },
    [],
  );

  const scheduleRedirect = (
    destination: "home" | "orders" | "subscriptions",
  ) => {
    redirectTimer.current = setTimeout(() => {
      switch (destination) {
        case "orders":
          router.replace("/(protected)/(tabs)/Home/OrderHistory");
          break;
        case "subscriptions":
          router.replace("/(protected)/(tabs)/Home/MySubscriptions");
          break;
        default:
          router.replace("/(protected)/(tabs)/Home");
      }
    }, 4000);
  };

  const verifyPayment = async (reference: string) => {
    try {
      setVerification({ message: "Confirming your payment...", status: "checking" });

      const response = await axiosClient.get("/payment/confirm", {
        params: { reference },
      });
      const attributes = response.data?.data?.attributes;
      const paymentStatus = attributes?.payment_status;
      const orderType = attributes?.order_type;

      if (paymentStatus === "fulfilled") {
        if (orderType === "subscription" || orderType === "plan") {
          useCartStore.getState().clearCart();
          useAddonStore.getState().clearAddon();
          useSubscriptionStore.getState().clearSubInfo();
        }

        setVerification({ message: "Payment successful", status: "success" });
        scheduleRedirect(
          orderType === "gift"
            ? "home"
            : orderType === "plan"
              ? "orders"
              : orderType === "subscription"
                ? "subscriptions"
                : "home"
        );
        return;
      }

      setVerification({
        message: "Payment was not successful.",
        status: "error",
      });
      scheduleRedirect("home");
    } catch (error: any) {
      setVerification({
        message:
          error.response?.data?.message ??
          "We couldn't confirm your payment. Please check your orders before trying again.",
        status: "error",
      });
      scheduleRedirect("home");
    }
  };

  const handleShouldStartLoad = (request: WebViewNavigation) => {
    const { url } = request;

    console.log("Redirect URL:", url);

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return true;
    }

    const isPaymentCallback =
      parsedUrl.origin === process.env.EXPO_PUBLIC_FRONTEND_URL &&
      parsedUrl.pathname === "/verify-payment";

    if (!isPaymentCallback) return true;

    const type = parsedUrl.searchParams.get("type");
    const status = parsedUrl.searchParams.get("status");
    const reference = parsedUrl.searchParams.get("reference");

    console.log("Payment type:", type);
    console.log("Reference:", reference);
    console.log("Status:", status);

    if (!reference) {
      setVerification({
        message: "The payment reference was not returned.",
        status: "error",
      });
      scheduleRedirect("home");
      return false;
    }

    if (!verifyingReference.current) {
      verifyingReference.current = reference;
      void verifyPayment(reference);
    }

    return false;
  };

  return (
    <SettingsScreenRoot>
      <SettingsHeader
        title="Complete Payment"
        subtitle="Pay securely with Paystack."
      />

      {verification.status !== "idle" ? (
        <View className="flex-1 items-center justify-center px-8">
          {verification.status === "checking" ? (
            <ActivityIndicator size="large" color="#218225" />
          ) : (
            <View
              className={`size-20 items-center justify-center rounded-full ${
                verification.status === "success" ? "bg-green-light" : "bg-red-50"
              }`}
            >
              <Ionicons
                name={
                  verification.status === "success"
                    ? "checkmark-circle"
                    : "close-circle"
                }
                size={48}
                color={verification.status === "success" ? "#218225" : "#B52227"}
              />
            </View>
          )}
          <Text className="mt-4 text-center font-mbold text-lg">
            {verification.message}
          </Text>
          <Text className="mt-2 text-center font-mregular text-sm text-gray">
            {verification.status === "checking"
              ? "Please wait..."
              : "Redirecting shortly..."}
          </Text>
          {verification.status !== "checking" ? (
            <ActivityIndicator
              className="mt-3"
              size="small"
              color={verification.status === "success" ? "#218225" : "#B52227"}
            />
          ) : null}
        </View>
      ) : !paymentLink ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-mbold text-lg">
            Payment link unavailable
          </Text>
          <Text className="mt-2 text-center font-mregular text-sm leading-6 text-gray">
            Please return to checkout and try again.
          </Text>
        </View>
      ) : (
        <View className="flex-1 overflow-hidden bg-white">
          <WebView
            source={{ uri: paymentLink }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            style={{ flex: 1 }}
          />

          {isLoading ? (
            <View
              pointerEvents="none"
              className="absolute inset-0 items-center justify-center bg-background"
            >
              <ActivityIndicator size="large" color="#218225" />
              <Text className="mt-3 font-mregular text-sm text-gray">
                Loading...
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </SettingsScreenRoot>
  );
};

export default PaymentGatewayScreen;
