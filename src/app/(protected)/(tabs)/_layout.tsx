import { Ionicons, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const size = 21;

          if (route.name === "Home") {
            return (
              <Octicons
                name={focused ? "home-fill" : "home"}
                size={size}
                color={color}
              />
            );
          }

          if (route.name === "Plans") {
            return (
              <MaterialCommunityIcons
                name={focused ? "cube" : "cube-outline"}
                size={23}
                color={color}
              />
            );
          }

          if (route.name === "Gift") {
            return (
              <MaterialCommunityIcons
                name={focused ? "gift" : "gift-outline"}
                size={size}
                color={color}
              />
            );
          }

          if (route.name === "Referrals") {
            return (
              <MaterialCommunityIcons
                name={focused ? "chart-box" : "chart-box-outline"}
                size={size}
                color={color}
              />
            );
          }

          if (route.name === "Settings") {
            return (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={size}
                color={color}
              />
            );
          }

          return null;
        },
        tabBarActiveTintColor: "#218225",
        tabBarInactiveTintColor: "#444444",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: "Montserrat-Medium",
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          paddingTop: 2,
          height: 55 + insets.bottom,
          paddingBottom: insets.bottom,
          position: "relative",
          elevation: 0,
        },
      })}
    >
      <Tabs.Screen name="Home" options={{ title: "Home" }} />
      <Tabs.Screen name="Plans" options={{ title: "Plans" }} />
      <Tabs.Screen name="Gift" options={{ title: "Gift" }} />
      <Tabs.Screen name="Referrals" options={{ title: "Referrals" }} />
      <Tabs.Screen name="Settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
