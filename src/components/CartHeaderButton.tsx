import { useAddonStore } from "@/store/addonStore";
import { useCartStore } from "@/store/cartStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useToast } from "react-native-toast-notifications";

export default function CartHeaderButton() {
  const toast = useToast();
  const subInfo = useSubscriptionStore((state) => state.subInfo);
  const setSubInfo = useSubscriptionStore((state) => state.setSubInfo);
  const totalBaseItems = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.qty, 0),
  );
  const totalAddons = useAddonStore((state) =>
    state.addonItems.reduce((total, item) => total + item.qty, 0),
  );
  const total = totalBaseItems + totalAddons;

  const goToCart = () => {
    if (!subInfo?.subscription) {
      toast.show("Please select a plan first.", { type: "warning" });
      return;
    }

    setSubInfo({
      ...subInfo,
      source: "tab"
    });
    router.push("/(onboarding)/ReviewCart");
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open cart${total > 0 ? `, ${total} ${total === 1 ? "item" : "items"}` : ""}`}
      hitSlop={8}
      onPress={goToCart}
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
