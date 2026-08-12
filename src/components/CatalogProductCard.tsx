import type { CatalogProductCardProps } from "@/types/catalog";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";

function CatalogProductCard({
  item,
  quantity,
  categoryBackgroundColor = "#DCFCE7",
  categoryTextColor = "#15803D",
  canIncrement = true,
  highlightWhenSelected = false,
  onDecrement,
  onIncrement,
}: CatalogProductCardProps) {
  const isAvailable = item?.stock > 0 && item?.isActive !== false;
  const canAdd = canIncrement && isAvailable;

  return (
    <View
      className={`mx-4 overflow-hidden rounded-2xl border ${
        highlightWhenSelected && quantity > 0
          ? "border-green bg-green-lighter"
          : "border-transparent bg-white"
      }`}
    >
      <View className="h-40 overflow-hidden bg-gray-50">
        <ExpoImage
          source={item.image}
          contentFit="cover"
          transition={200}
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      <View className="p-4">
        <Text className="font-mbold text-lg">{item.name}</Text>

        <View className="mt-1 flex-row items-center gap-2">
          <Text className="font-mregular text-xs text-gray">
            {item.weightLabel}
          </Text>
          <View
            className="rounded-full px-2 py-1"
            style={{ backgroundColor: categoryBackgroundColor }}
          >
            <Text
              className="font-msbold text-[9px]"
              style={{ color: categoryTextColor }}
            >
              {item.category}
            </Text>
          </View>
        </View>

        <Text className="mt-3 font-mbold text-lg text-green">{item.price}</Text>
        <Text
          className={`mt-1 font-mregular text-xs ${isAvailable ? "text-green" : "text-red-600"}`}
        >
          {isAvailable ? `${item?.stock} currently in stock` : "Out of stock"}
        </Text>

        {quantity > 0 ? (
          <View className="mt-4 flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Decrease ${item.name} quantity`}
              onPress={() => onDecrement(item)}
              className="size-12 items-center justify-center rounded-lg border border-[#E8E8E8] bg-white active:bg-[#F5F5F5]"
            >
              <Ionicons name="remove" size={26} color="#292929" />
            </Pressable>

            <Text
              accessibilityRole="text"
              accessibilityLabel={`${item.name} quantity ${quantity}`}
              className="font-mbold text-xl text-[#292929]"
            >
              {quantity}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Increase ${item.name} quantity`}
              disabled={!canAdd}
              onPress={() => onIncrement(item)}
              className={`size-12 items-center justify-center rounded-lg bg-green ${
                canAdd ? "active:opacity-80" : "opacity-40"
              }`}
            >
              <Ionicons name="add" size={27} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.name}`}
            disabled={!canAdd}
            onPress={() => onIncrement(item)}
            className={`mt-4 h-12 items-center justify-center rounded-lg border ${
              canAdd
                ? "border-green bg-white active:bg-green-lighter"
                : "border-[#D5D5D5] bg-[#F5F5F5] opacity-50"
            }`}
          >
            <Text
              className={`font-mbold text-base ${canAdd ? "text-green" : "text-gray"}`}
            >
              + Add
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default memo(CatalogProductCard);
