import {
  SettingsHeader,
  SettingsScreenRoot,
} from "@/components/settings/SettingsShell";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { WebView, type WebViewNavigation } from "react-native-webview";

const PaymentGatewayScreen = () => {
  
  const { paymentLink } = useLocalSearchParams() as any;
  const [isLoading, setIsLoading] = useState(true);
  console.log("Payment link:", paymentLink);

  const handleNavigationChange = (navigation: WebViewNavigation) => {
    if (!navigation.url) return;

    try {
      const parsedUrl = new URL(navigation.url);
      const orderId = parsedUrl.searchParams.get("orderId");
      const orderReference = parsedUrl.searchParams.get("orderReference");

      if (!orderId && !orderReference) return;

      // Handle the completed payment after the backend redirect is confirmed.
    } catch {
      // Paystack may visit intermediate URLs that are not parseable here.
    }
  };

  return (
    <SettingsScreenRoot>
      <SettingsHeader
        title="Complete Payment"
        subtitle="Pay securely with Paystack."
      />

      {!paymentLink ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-mbold text-xl">
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
            onNavigationStateChange={handleNavigationChange}
            style={{ flex: 1 }}
          />

          {isLoading ? (
            <View
              pointerEvents="none"
              className="absolute inset-0 items-center justify-center bg-background"
            >
              <ActivityIndicator size="large" color="#218225" />
              <Text className="mt-3 font-mregular text-sm text-gray">
                Loading secure payment...
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </SettingsScreenRoot>
  );
};

export default PaymentGatewayScreen;
