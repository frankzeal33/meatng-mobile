import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
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
import NetworkStatusBanner from "@/components/NetworkStatusBanner";
import * as Linking from 'expo-linking';

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

  useEffect(() => {

    const handleDeepLink = ({ url }: {url: any}) => {
      const data = Linking.parse(url);
      console.log('Received payment callback:', data);

      const hostname = data.hostname
      const query = data.queryParams
      
      if(hostname === "verify-payment"){

        switch (query?.screen) {
          case 'plan':

            if(query?.status === "successful"){

            }else{
              router.replace("/(protected)/(tabs)/Home")
            }
            break;
  
          case 'gift':
            
            router.replace("/(protected)/(tabs)/Home");
            break;

          case 'subscription':
            
            if(query?.status === "successful"){
              // StoreClearItems()
            }
            router.replace("/(protected)/(tabs)/Home/OrderHistory")
            break;
  
          default:
            router.replace("/(protected)/(tabs)/Home");
            break;
        }
      }
      
    };

  const sub = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened from a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      sub.remove();
    };
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
          <NetworkStatusBanner />
          <LayoutLoader />
        </ToastProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
