import CatalogCategories from "@/components/CatalogCategories";
import CatalogProductCard from "@/components/CatalogProductCard";
import CustomButton from "@/components/CustomButton";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { catalogProducts } from "@/data/meatCatalog";
import type {
  AddOnCategoriesProps,
  CatalogProduct,
  CatalogProductListItemProps,
  CategoryFilter,
} from "@/types/catalog";
import type { AddOnsRouteParams } from "@/types/onboarding";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AddOnCategories = memo(function AddOnCategories({
  activeCategory,
  onCategoryChange,
}: AddOnCategoriesProps) {
  return (
    <View className="bg-background">
      <Text className="px-4 font-mbold text-sm">Categories</Text>
      <CatalogCategories
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />
    </View>
  );
});

export default function AddOns() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<AddOnsRouteParams>();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [overlayActive, setOverlayActive] = useState(false);
  const stickySectionOffsetY = useRef(9999);

  const visibleProducts = useMemo(
    () =>
      activeCategory === "All"
        ? catalogProducts
        : catalogProducts.filter(
            (product) => product.category === activeCategory,
          ),
    [activeCategory],
  );

  const handleIncrementProduct = useCallback((product: CatalogProduct) => {
    setQuantities((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
  }, []);

  const handleDecrementProduct = useCallback((product: CatalogProduct) => {
    setQuantities((current) => {
      const currentQuantity = current[product.id] ?? 0;

      if (currentQuantity <= 1) {
        const { [product.id]: _removed, ...remaining } = current;
        return remaining;
      }

      return {
        ...current,
        [product.id]: currentQuantity - 1,
      };
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: CatalogProductListItemProps) => (
      <CatalogProductCard
        item={item}
        quantity={quantities[item.id] ?? 0}
        onDecrement={handleDecrementProduct}
        onIncrement={handleIncrementProduct}
      />
    ),
    [handleDecrementProduct, handleIncrementProduct, quantities],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setOverlayActive(
        event.nativeEvent.contentOffset.y >= stickySectionOffsetY.current,
      );
    },
    [],
  );

  const handleStickySectionLayout = useCallback((y: number) => {
    stickySectionOffsetY.current = y;
  }, []);

  const renderListHeader = useCallback(
    () => (
      <View>
        <View className="px-4 pb-4">
          <Text className="font-mregular text-2xl">
            Want more than what's included in your plan?
          </Text>
          <Text className="mt-1 font-msbold text-2xl">
            Simply select from our available add-ons.
          </Text>
        </View>

        <View
          onLayout={(event) =>
            handleStickySectionLayout(event.nativeEvent.layout.y)
          }
        >
          <AddOnCategories
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </View>
      </View>
    ),
    [activeCategory, handleStickySectionLayout],
  );

  const handleReviewCart = useCallback(() => {
    router.push({
      pathname: "/(onboarding)/ReviewCart",
      params: {
        planName: params.planName ?? "Signature Box",
        weight: params.weight ?? "10kg",
        frequency: params.frequency ?? "Weekly",
        price: params.price ?? "₦70,000.00",
        boxSelections: params.boxSelections ?? "{}",
        addOnSelections: JSON.stringify(quantities),
      },
    });
  }, [params, quantities]);

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StatusBar style="dark" />

      <View className="px-4">
        <SpaceBetweenHeader
          onBackPress={() => router.back()}
          showRight={false}
        />
      </View>

      <View className="relative flex-1">
        <FlatList
          data={visibleProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          extraData={quantities}
          ListHeaderComponent={renderListHeader}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            gap: 14,
            paddingTop: 4,
            paddingBottom: 16,
          }}
        />

        <View
          pointerEvents={overlayActive ? "box-none" : "none"}
          className="absolute inset-x-0 top-0 z-20 bg-background"
          style={{ opacity: overlayActive ? 1 : 0 }}
        >
          <AddOnCategories
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </View>
      </View>

      <View className="px-4">
        <CustomButton
          title="Review Cart"
          handlePress={handleReviewCart}
          containerStyles="mb-1 mt-2 w-full"
          textStyles="text-white"
        />
      </View>
    </View>
  );
}
