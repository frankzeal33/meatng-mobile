import { useAddonStore } from "@/store/addonStore";
import { useCartStore } from "@/store/cartStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function CartHeaderButton() {

  const totalItems = useCartStore((state) => state.totalItems);
  const totalAddonItems = useAddonStore((state) => state.totalAddonItems);

  const totalBaseitems = totalItems();
  const totalAddons = totalAddonItems();

  const total = totalBaseitems + totalAddons;

  return (
    <Pressable
      hitSlop={8}
      onPress={() => router.push("/(onboarding)/ReviewCart")}
      className="relative size-12 items-center justify-center rounded-full bg-green-light active:opacity-70"
    >
      <Ionicons name="cart-outline" size={24} color="#218225" />
      {total > 0 && (
        <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1">
          <Text className="text-center font-msbold text-[10px] leading-none text-white">
            {total > 99 ? "99+" : total}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
