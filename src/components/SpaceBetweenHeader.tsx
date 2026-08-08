import type { SpaceBetweenHeaderProps } from "@/types/components";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export default function SpaceBetweenHeader({
  onBackPress,
  onRightPress,
  rightLabel = "Gift Someone",
  rightContent,
  showBack = true,
  showRight = true,
  className = "",
}: SpaceBetweenHeaderProps) {
  return (
    <View className={`flex-row py-3 items-center justify-between ${className}`}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={onBackPress}
          className="size-12 items-center justify-center rounded-full bg-green-light active:opacity-70"
        >
          <Ionicons name="arrow-back" size={22} color="#218225" />
        </Pressable>
      ) : (
        <View className="size-12" />
      )}

      {showRight ? (
        (rightContent ?? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightLabel}
            onPress={onRightPress}
            className="h-11 items-center justify-center rounded-lg bg-green px-5 active:opacity-80"
          >
            <Text className="font-msbold text-sm text-white">{rightLabel}</Text>
          </Pressable>
        ))
      ) : (
        <View />
      )}
    </View>
  );
}
