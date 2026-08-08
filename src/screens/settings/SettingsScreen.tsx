import {
  SettingsScreenRoot,
} from "@/components/settings/SettingsShell";
import { useAuthStore } from "@/store/AuthStore";
import type { SettingsMenuItem, SettingsMenuRowProps } from "@/types/settings";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useCallback } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

const menuItems: SettingsMenuItem[] = [
  {
    id: "personal",
    title: "Personal Information",
    icon: "account",
    route: "/(protected)/(tabs)/Settings/PersonalInformation",
  },
  {
    id: "password",
    title: "Change Password",
    icon: "lock",
    route: "/(protected)/(tabs)/Settings/ChangePassword",
  },
  {
    id: "addresses",
    title: "Addresses",
    icon: "lock",
    route: "/(protected)/(tabs)/Settings/Addresses",
  },
  { id: "logout", title: "Logout", icon: "logout", destructive: true },
];

function SettingsMenuRow({ item, onPress }: SettingsMenuRowProps) {
  const color = item.destructive ? "#B52227" : "#218225";
  return (
    <Pressable
      onPress={() => onPress(item)}
      className="flex-row items-center rounded-xl bg-white px-4 py-5 active:opacity-70"
    >
      <View
        className={`size-9 items-center justify-center rounded-full ${item.destructive ? "bg-red-100" : "bg-green-light"}`}
      >
        <MaterialCommunityIcons name={item.icon} size={19} color={color} />
      </View>
      <Text
        className={`ml-2 flex-1 font-mmedium text-base ${item.destructive ? "text-red-600" : "text-black"}`}
      >
        {item.title}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={25}
        color={item.destructive ? "#E7000B" : "#000"}
      />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const logout = useAuthStore((state) => state.logout);

  const openItem = useCallback(
    (item: SettingsMenuItem) => {
      if (item.id === "logout") {
        logout();
        router.replace("/(onboarding)/Login");
        return;
      }

      if (item.route) {
        router.push(item.route);
      }
    },
    [logout],
  );

  return (
    <SettingsScreenRoot>
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SettingsMenuRow item={item} onPress={openItem} />
        )}
        ItemSeparatorComponent={() => <View className="h-2" />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 22 }}
        ListHeaderComponent={
          <View className="mb-7">
            <Text className="font-mbold text-xl">Account Settings</Text>
            <Text className="mt-1 font-mregular text-xs text-gray">
              Update your personal information and preferences.
            </Text>
          </View>
        }
      />
    </SettingsScreenRoot>
  );
}
