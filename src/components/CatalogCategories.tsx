import { catalogCategories } from "@/data/meatCatalog";
import type { CatalogCategoriesProps } from "@/types";
import { memo } from "react";
import { Pressable, ScrollView, Text } from "react-native";

function CatalogCategories({
  activeCategory,
  categories,
  onCategoryChange,
}: CatalogCategoriesProps) {
  const options =
    categories ??
    catalogCategories.map((category) => ({
      id: category,
      name: category,
      value: category,
    }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-2 px-4"
      contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
    >
      {options.map((category) => {
        const isActive = activeCategory === category.value;

        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onCategoryChange(category.value)}
            className={`min-w-24 items-center rounded-full border px-5 py-2 ${
              isActive ? "border-green bg-green" : "border-gray-300 bg-white"
            }`}
          >
            <Text
              className={`font-msbold text-xs ${isActive ? "text-white" : "text-gray"}`}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default memo(CatalogCategories);
