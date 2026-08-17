import { useAuthStore } from "@/store/AuthStore";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function App() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-green">
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <Redirect
      href={isAuthenticated ? "/(protected)/(tabs)/Home" : "/(onboarding)"}
    />
  );
}
