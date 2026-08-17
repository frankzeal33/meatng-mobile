import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { ToastProvider } from "react-native-toast-notifications";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import LayoutLoader from "@/hooks/LayoutLoader";
import { useNetworkStore } from "@/store/NetworkStore";
import NetInfo from "@react-native-community/netinfo";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Montserrat-Black": require("../../assets/fonts/Montserrat-Black.ttf"),
    "Montserrat-Bold": require("../../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-SemiBold": require("../../assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Light": require("../../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Medium": require("../../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-Regular": require("../../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Thin": require("../../assets/fonts/Montserrat-Thin.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      useNetworkStore
        .getState()
        .setNetworkState(state.isConnected, state.isInternetReachable);
    });

    return unsubscribe;
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <BottomSheetModalProvider>
        <ToastProvider
          placement="top"
          animationType="slide-in"
          successColor="#E2EFE3"
          dangerColor="#FDE8E8"
          warningColor="#FFF4D6"
          normalColor="#F4F9F4"
          textStyle={{ color: "#292929" }}
          offset={70}
          successIcon={
            <Octicons name="check-circle-fill" size={16} color="#218225" />
          }
          dangerIcon={
            <Ionicons name="close-circle-sharp" size={16} color="#B52227" />
          }
          warningIcon={<Ionicons name="warning" size={16} color="#B26A00" />}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
          <LayoutLoader/>
        </ToastProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
