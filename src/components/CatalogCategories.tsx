import { catalogCategories } from "@/data/meatCatalog";
import type { CatalogCategoriesProps } from "@/types/catalog";
import { memo } from "react";
import { Pressable, ScrollView, Text } from "react-native";

function CatalogCategories({
  activeCategory,
  onCategoryChange,
}: CatalogCategoriesProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-2 px-4"
      contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
    >
      {catalogCategories.map((category) => {
        const isActive = activeCategory === category;

        return (
          <Pressable
            key={category}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onCategoryChange(category)}
            className={`min-w-24 items-center rounded-full border px-5 py-2 ${
              isActive ? "border-green bg-green" : "border-gray-300 bg-white"
            }`}
          >
            <Text
              className={`font-msbold text-xs ${isActive ? "text-white" : "text-gray"}`}
            >
              {category}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default memo(CatalogCategories);
