import CustomButtomSheet from "@/components/CustomButtomSheet";
import CustomButton from "@/components/CustomButton";
import CatalogCategories from "@/components/CatalogCategories";
import CatalogProductCard from "@/components/CatalogProductCard";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { catalogProducts } from "@/data/meatCatalog";
import type {
  CatalogProduct,
  CatalogProductListItemProps,
  CategoryFilter,
  StickyControlsProps,
} from "@/types/catalog";
import type { PlanRouteParams } from "@/types/onboarding";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TARGET_WEIGHT = 5000;
const PREBUILT_WEIGHT = 5000;
const preBuiltSummary = [
  {
    id: "boneless-beef",
    name: "Boneless Beef - 1kg X (2)",
    weight: "1kg X (2)",
  },
  { id: "boneless-500g", name: "Boneless Beef (500g)", weight: "500g" },
  { id: "bone-in-beef", name: "Bone in Beef", weight: "1kg" },
  { id: "whole-chicken", name: "Whole Chicken", weight: "1.5kg" },
];

function formatWeight(weightInGrams: number) {
  if (weightInGrams >= 1000) {
    const weightInKg = weightInGrams / 1000;
    return `${Number.isInteger(weightInKg) ? weightInKg : weightInKg.toFixed(1)}kg`;
  }

  return `${weightInGrams}g`;
}

const StickyControls = memo(function StickyControls({
  activeCategory,
  onCategoryChange,
  progressPercent,
  remainingWeight,
  selectedWeight,
}: StickyControlsProps) {
  return (
    <View className="bg-background">
      <View className="mx-4 rounded-2xl bg-white p-4">
        <View className="flex-row justify-between">
          <Text className="font-mregular text-xs text-gray">
            {selectedWeight}g / 5kg filled
          </Text>
          <Text className="font-mregular text-xs text-gray">
            {remainingWeight}g left
          </Text>
        </View>
        <View className="mt-3 h-2 overflow-hidden rounded-full bg-green-light">
          <View
            className="h-full rounded-full bg-green"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>

      <Text className="mt-2 px-4 font-mbold text-sm">Categories</Text>
      <CatalogCategories
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />
    </View>
  );
});

export default function BuildYourBox() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<PlanRouteParams>();
  const summaryModalRef = useRef<BottomSheetModal>(null);
  const summarySnapPoints = useMemo(() => ["92%"], []);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [overlayActive, setOverlayActive] = useState(false);
  const stickySectionOffsetY = useRef(9999);

  const selectedWeight = useMemo(
    () =>
      catalogProducts.reduce(
        (total, product) =>
          total + product.weightInGrams * (quantities[product.id] ?? 0),
        0,
      ),
    [quantities],
  );
  const selectedProducts = useMemo(
    () =>
      catalogProducts.filter((product) => (quantities[product.id] ?? 0) > 0),
    [quantities],
  );
  const planName = params.planName ?? "Signature Box";
  const planWeight = params.weight ?? "10kg";
  const frequency = params.frequency ?? "Weekly";
  const planPrice = params.price ?? "₦70,000.00";
  const planWeightInGrams = (Number.parseFloat(planWeight) || 10) * 1000;
  const totalBoxWeight = PREBUILT_WEIGHT + selectedWeight;
  const totalProgress = Math.min(
    100,
    (totalBoxWeight / planWeightInGrams) * 100,
  );
  const remainingWeight = Math.max(0, TARGET_WEIGHT - selectedWeight);
  const progressPercent = Math.min(100, (selectedWeight / TARGET_WEIGHT) * 100);

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
    setQuantities((current) => {
      const currentWeight = catalogProducts.reduce(
        (total, item) => total + item.weightInGrams * (current[item.id] ?? 0),
        0,
      );

      if (currentWeight + product.weightInGrams > TARGET_WEIGHT) {
        return current;
      }

      return {
        ...current,
        [product.id]: (current[product.id] ?? 0) + 1,
      };
    });
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
        canIncrement={selectedWeight + item.weightInGrams <= TARGET_WEIGHT}
        onDecrement={handleDecrementProduct}
        onIncrement={handleIncrementProduct}
      />
    ),
    [
      handleDecrementProduct,
      handleIncrementProduct,
      quantities,
      selectedWeight,
    ],
  );

  const handleContinue = useCallback(() => {
    summaryModalRef.current?.dismiss();
    router.push({
      pathname: "/(onboarding)/AddOns",
      params: {
        planName,
        weight: planWeight,
        frequency,
        price: planPrice,
        boxSelections: JSON.stringify(quantities),
      },
    });
  }, [frequency, planName, planPrice, planWeight, quantities]);

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
        <View className="flex-row items-start justify-between gap-3 pb-4 px-4">
          <View className="flex-1">
            <Text className="font-mbold text-[28px] leading-9 tracking-[-0.7px] text-[#292929]">
              Build Your Box
            </Text>
            <Text className="mt-1 font-mregular text-sm text-gray">
              Fill the remaining 5kg from this catalog.
            </Text>
          </View>
          <View className="rounded-full bg-green-light px-3 py-2">
            <Text className="font-msbold text-xs text-green">
              {selectedWeight}g / {TARGET_WEIGHT / 1000}kg
            </Text>
          </View>
        </View>

        <View
          onLayout={(event) =>
            handleStickySectionLayout(event.nativeEvent.layout.y)
          }
        >
          <StickyControls
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            progressPercent={progressPercent}
            remainingWeight={remainingWeight}
            selectedWeight={selectedWeight}
          />
        </View>
      </View>
    ),
    [
      activeCategory,
      handleStickySectionLayout,
      progressPercent,
      remainingWeight,
      selectedWeight,
    ],
  );

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
          extraData={{ quantities, selectedWeight }}
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
          <StickyControls
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            progressPercent={progressPercent}
            remainingWeight={remainingWeight}
            selectedWeight={selectedWeight}
          />
        </View>
      </View>

      <View className="px-4">
        <CustomButton
          title="Continue"
          handlePress={() => summaryModalRef.current?.present()}
          containerStyles="mb-1 mt-2 w-full"
          textStyles="text-white"
        />
      </View>

      <CustomButtomSheet
        ref={summaryModalRef}
        snapPoints={summarySnapPoints}
        enablePenDown={false}
        dynamicSizing={false}
        scrollable
      >
        <View className="h-full">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close box summary"
            hitSlop={10}
            onPress={() => summaryModalRef.current?.dismiss()}
            className="mb-4 size-12 items-center justify-center rounded-full bg-green-light"
          >
            <Ionicons name="arrow-back" size={22} color="#218225" />
          </Pressable>

          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
          >
            <Text className="font-mbold text-3xl">Your Box</Text>

            <View className="rounded-2xl bg-white p-4">
              <SpaceBetween
                title="Total weight"
                value={`${formatWeight(totalBoxWeight)} / ${planWeight}`}
              />
              <View className="my-4 h-3 overflow-hidden rounded-full bg-green-light">
                <View
                  className="h-full rounded-full bg-green"
                  style={{ width: `${totalProgress}%` }}
                />
              </View>
              <Text className="font-mregular text-base text-[#292929]">
                Plan: <Text className="font-mbold">{planName}</Text>
              </Text>
              <Text className="mt-3 font-mregular text-base text-[#292929]">
                Frequency: <Text className="font-mbold">{frequency}</Text>
              </Text>
            </View>

            <View className="rounded-2xl bg-white p-4">
              <Text className="mb-4 font-mbold text-xl text-[#292929]">
                In your box
              </Text>
              {preBuiltSummary.map((item, index) => (
                <SpaceBetween
                  key={item.id}
                  title={item.name}
                  value={item.weight}
                  containerStyles={index === 0 ? "" : "mt-4"}
                  titleStyles="flex-1 text-gray"
                />
              ))}
            </View>

            <View className="rounded-2xl bg-white p-5">
              <Text className="mb-4 font-mbold text-xl text-green">
                Your picks
              </Text>
              {selectedProducts.length > 0 ? (
                <FlatList
                  data={selectedProducts}
                  keyExtractor={(product) => product.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View className="h-4" />}
                  renderItem={({ item: product }) => {
                    const quantity = quantities[product.id] ?? 0;
                    return (
                      <SpaceBetween
                        title={
                          quantity > 1
                            ? `${product.name} × ${quantity}`
                            : product.name
                        }
                        value={formatWeight(product.weightInGrams * quantity)}
                        titleStyles="flex-1 text-gray"
                      />
                    );
                  }}
                />
              ) : (
                <Text className="font-mregular text-base text-gray">
                  No additional cuts selected yet.
                </Text>
              )}
            </View>

            <View className="rounded-2xl bg-white p-5">
              <SpaceBetween
                title="Plan price"
                value={planPrice}
                titleStyles="text-lg text-gray"
                valueStyles="text-lg"
              />
              <View className="my-4 h-px bg-gray-200" />
              <SpaceBetween
                title="Total"
                value={planPrice}
                titleStyles="font-mbold text-xl"
                valueStyles="font-mbold text-xl text-green"
              />
            </View>
          </BottomSheetScrollView>

          <CustomButton
            title="Continue"
            handlePress={handleContinue}
            containerStyles="mb-2 mt-4 w-full"
            textStyles="text-white"
          />
        </View>
      </CustomButtomSheet>
    </View>
  );
}
