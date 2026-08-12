import { useAddonStore } from "@/store/addonStore";
import { useCartStore } from "@/store/cartStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function CartHeaderButton() {
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.qty, 0),
  );
  const addonCount = useAddonStore((state) =>
    state.addonItems.reduce((total, item) => total + item.qty, 0),
  );
  const count = cartCount + addonCount;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open cart, ${count} items`}
      hitSlop={8}
      onPress={() => router.push("/(onboarding)/ReviewCart")}
      className="relative size-12 items-center justify-center rounded-full bg-green-light active:opacity-70"
    >
      <Ionicons name="cart-outline" size={24} color="#218225" />
      <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1">
        <Text className="text-center font-msbold text-[10px] leading-none text-white">
          {count > 99 ? "99+" : count}
        </Text>
      </View>
    </Pressable>
  );
}
