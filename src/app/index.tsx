// import { images } from "@/constants";
import { useAuthStore } from "@/store/AuthStore";
import { useProfileStore } from "@/store/ProfileStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

export default function App() {
  const { login, logout, isLoading, setLoading, isAuthenticated } =
    useAuthStore((state: any) => state);
  const setProfile = useProfileStore((state: any) => state.setProfile);

  useEffect(() => {
    const getData = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("accessToken");
        const userProfile = await AsyncStorage.getItem("userProfile");
        const hideStatus = await AsyncStorage.getItem("hideBalance");
        const user = userProfile ? JSON.parse(userProfile) : null;

        if (storedToken) {
          if (user) {
            console.log("redux user", user);
            setProfile(user);
          }
          login(storedToken);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-blue">
        <StatusBar style="light" />
        <View className="items-center justify-center">
          {/* <Image
            source={images.chatBot}
            style={styles.logo}
            resizeMode="contain"
          /> */}
          {/* <Text className="text-white font-mbold text-3xl mt-1">Buzzycash</Text> */}
        </View>
      </View>
    );
  }

  return (
    <Redirect
      href={isAuthenticated ? "/(protected)/(tabs)/Home" : "/(onboarding)"}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    width: 140,
    height: 150,
  },
});
