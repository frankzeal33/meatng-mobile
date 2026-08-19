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
      
      // if(hostname === "goto"){

      //   switch (query?.screen) {
      //     case 'fx':

      //       if(query?.status === "successful"){

      //         if(query?.currencyTo === "NGN"){
      //           router.replace({
      //             pathname: "/(protected)/(routes)/NairaAccount",
      //             params: {
      //               status: query?.status,          
      //               reference: query?.reference,
      //               currencyFrom: query?.currencyFrom,
      //               currencyTo: query?.currencyTo,     
      //               paymentType: query?.paymentType,  
      //             },
      //           });
      //         }else if(query?.currencyTo === "GBP"){
      //           router.replace({
      //             pathname: "/(protected)/(routes)/GBPAccount",
      //             params: {
      //               status: query?.status,           // "successful"
      //               reference: query?.reference,
      //               currencyFrom: query?.currencyFrom, // "NGN"
      //               currencyTo: query?.currencyTo,     // "GBP"
      //               paymentType: query?.paymentType,   // "fx"
      //             },
      //           });
      //         }else if(query?.currencyTo === "USD"){
      //           router.replace({
      //             pathname: "/(protected)/(routes)/USDAccount",
      //             params: {
      //               status: query?.status,          
      //               reference: query?.reference,
      //               currencyFrom: query?.currencyFrom,
      //               currencyTo: query?.currencyTo,     
      //               paymentType: query?.paymentType,  
      //             },
      //           });
      //         }else if(query?.currencyTo === "EUR"){
      //           router.replace({
      //             pathname: "/(protected)/(routes)/EUROAccount",
      //             params: {
      //               status: query?.status,          
      //               reference: query?.reference,
      //               currencyFrom: query?.currencyFrom,
      //               currencyTo: query?.currencyTo,     
      //               paymentType: query?.paymentType,  
      //             },
      //           });
      //         }else{
      //           router.replace("/(protected)/(tabs)/home")
      //         }
      //       }else{
      //         router.replace("/(protected)/(tabs)/home")
      //       }
      //       break;
  
      //     case 'wallet':
            
      //       router.replace("/(protected)/(tabs)/home");
      //       break;

      //     case 'shop4me':
      //       if(query?.status === "successful"){
      //         Shop4MeClearItems();
      //       }
      //       router.replace("/(protected)/(routes)/ShopWithLinkOrders")
           
      //       break;

      //     case 'orders':
            
      //       if(query?.status === "successful"){
      //         StoreClearItems()
      //       }
      //       router.replace("/(protected)/(routes)/FoodingOrders")
      //       break;

      //     case 'amazon':
            
      //       if(query?.status === "successful"){
      //         AmazonClearItems();
      //       }
      //       router.replace("/(protected)/(routes)/AmazonOrders")
      //       break;

      //     case 'shipments':
            
      //       router.replace("/(protected)/(routes)/MyShipments");
      //       break;

      //     case 'naija-shop':
            
      //       if(query?.status === "successful"){
      //         NaijaShopClearItems();
      //       }
      //       router.replace("/(protected)/(routes)/AmazonOrders")
      //       break;
  
      //     default:
      //       router.replace("/(protected)/(tabs)/home");
      //       break;
      //   }
      // }
      
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
