import type { SpaceBetweenProps } from "@/types";
import { Text, View } from "react-native";

export default function SpaceBetween({
  title,
  value,
  containerStyles = "",
  titleStyles = "",
  valueStyles = "",
}: SpaceBetweenProps) {
  return (
    <View
      className={`flex-row items-center justify-between gap-4 ${containerStyles}`}
    >
      <Text className={`font-mregular text-base ${titleStyles}`}>{title}</Text>
      <Text
        className={`flex-1 text-right font-mregular text-base ${valueStyles}`}
      >
        {value}
      </Text>
    </View>
  );
}
