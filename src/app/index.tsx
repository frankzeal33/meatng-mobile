import { images } from "@/constants";
import { useAuthStore } from "@/store/AuthStore";
import { hasCompletedOnboarding } from "@/utils/onboardingStorage";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function App() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const loadOnboardingStatus = async () => {
      try {
        const notFirstTime = await hasCompletedOnboarding()
        setOnboardingCompleted(notFirstTime);
      } catch {
        setOnboardingCompleted(false);
      }
    };

    void loadOnboardingStatus();
  }, []);

  if (isLoading || (!isAuthenticated && onboardingCompleted === null)) {
    return (
      <View className="flex-1 justify-center items-center bg-green">
        <StatusBar style="light" />
        <View className="flex-row justify-center items-center">
          <Image
            source={images.splashIcon}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  return (
    <Redirect
      href={
        isAuthenticated
          ? "/(protected)/(tabs)/Home"
          : onboardingCompleted
            ? "/(onboarding)/Login"
            : "/(onboarding)"
      }
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 170,
    height: 170,
  },
});
