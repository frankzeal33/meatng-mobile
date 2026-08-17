import type { RetryButtonProps } from "@/types";
import { Pressable, Text } from "react-native";

const RetryButton = ({
  onPress,
  containerStyles = "",
  label = "Retry",
}: RetryButtonProps) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    className={`h-9 items-center justify-center rounded-md bg-green px-4 active:opacity-70 ${containerStyles}`}
  >
    <Text className="font-mbold text-xs text-white">{label}</Text>
  </Pressable>
);

export default RetryButton;
