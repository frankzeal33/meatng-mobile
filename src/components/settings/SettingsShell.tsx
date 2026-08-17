import type {
  SettingsHeaderProps,
  SettingsScreenRootProps,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function SettingsScreenRoot({ children }: SettingsScreenRootProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      {children}
    </View>
  );
}

export function SettingsHeader({ title, subtitle }: SettingsHeaderProps) {
  return (
    <View className="flex-row items-center px-4 py-4">
      <Pressable
        hitSlop={10}
        onPress={() => router.back()}
        className="size-12 items-center justify-center rounded-full bg-green-light active:opacity-70"
      >
        <Ionicons name="arrow-back" size={22} color="#218225" />
      </Pressable>
      <View className="ml-2 flex-1">
        <Text className="font-mbold text-xl">{title}</Text>
        {!!subtitle && (
          <Text className="font-mregular text-xs text-gray">{subtitle}</Text>
        )}
      </View>
    </View>
  );
}
