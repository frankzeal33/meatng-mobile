import CatalogCategories from "@/components/CatalogCategories";
import CatalogProductCard from "@/components/CatalogProductCard";
import CartHeaderButton from "@/components/CartHeaderButton";
import CustomButtomSheet from "@/components/CustomButtomSheet";
import CustomButton from "@/components/CustomButton";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { axiosClient } from "@/globalApi";
import { useCartStore } from "@/store/cartStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import type {
  CatalogCategoryOption,
  CatalogProduct,
  CatalogProductListItemProps,
  CategoryFilter,
  StickyControlsProps,
} from "@/types";
import { formatWeight, toGrams } from "@/utils/conversion";
import displayCurrency from "@/utils/displayCurrency";
import { formatEnums } from "@/utils/formatEnums";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

type ProductResponseItem = {
  id: string;
  attributes?: {
    name?: string;
    image?: string;
    price?: number;
    mainValue?: number;
    unit?: "kg" | "g";
    formattedWeight?: string;
    stockQuantity?: number;
    is_active?: boolean;
  };
  relationships?: {
    categoryDetails?: {
      data?: Array<{
        id?: string;
        attributes?: { name?: string; slug?: string };
      }>;
    };
  };
};

type CategoryResponseItem = {
  id: string;
  attributes?: { name?: string; slug?: string };
};

type ProductMeta = { currentPage?: number; totalPages?: number };

const CATEGORY_COLORS = [
  { background: "#FEE2E2", text: "#B91C1C" },
  { background: "#DCFCE7", text: "#15803D" },
  { background: "#DBEAFE", text: "#1D4ED8" },
  { background: "#FEF9C3", text: "#A16207" },
  { background: "#F3E8FF", text: "#7E22CE" },
  { background: "#FCE7F3", text: "#BE185D" },
  { background: "#E0E7FF", text: "#4338CA" },
];

function mapProduct(item: ProductResponseItem): CatalogProduct {
  const attributes = item?.attributes;
  const category = item?.relationships?.categoryDetails?.data?.[0];
  const weight = attributes?.mainValue ?? 0;
  const weightUnit = attributes?.unit ?? "g";

  return {
    id: item?.id,
    name: attributes?.name ?? "Unnamed product",
    image: attributes?.image ?? "",
    price: displayCurrency(attributes?.price ?? 0, "NGN"),
    weight,
    weightUnit,
    weightLabel: attributes?.formattedWeight ?? `${weight}${weightUnit}`,
    weightInGrams: toGrams(weight, weightUnit),
    category: category?.attributes?.name ?? "Other",
    categoryId: category?.id ?? "other",
    categorySlug: category?.attributes?.slug ?? "other",
    stock: attributes?.stockQuantity ?? 0,
    isActive: attributes?.is_active ?? false,
  };
}

const StickyControls = memo(function StickyControls({
  activeCategory,
  categories,
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
            {selectedWeight === remainingWeight
              ? "Complete!"
              : `${formatWeight(selectedWeight)} / ${formatWeight(remainingWeight)}`}
          </Text>
          <Text className="font-mregular text-xs text-gray">
            {selectedWeight === remainingWeight
              ? "Complete!"
              : `${formatWeight(Math.max(0, remainingWeight - selectedWeight))} left`}
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
        categories={categories}
        onCategoryChange={onCategoryChange}
      />
    </View>
  );
});

export default function BuildYourBox() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const subInfo = useSubscriptionStore((state) => state.subInfo);
  const attributes = subInfo?.subscription?.attributes;
  const items = useCartStore((state) => state.items);
  const add = useCartStore((state) => state.add);
  const setQty = useCartStore((state) => state.setQty);
  const summaryModalRef = useRef<BottomSheetModal>(null);
  const summarySnapPoints = useMemo(() => ["92%"], []);
  const stickySectionOffsetY = useRef(9999);
  const loadingMoreRef = useRef(false);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategoryOption[]>([]);
  const [activeCategory, setActiveCategory] =
    useState<CategoryFilter>("all");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ProductMeta | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [productError, setProductError] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);

  const requiredCategoryName =
    attributes?.category_rules?.[0]?.category_name;
  const remainingWeightInGrams = toGrams(
    attributes?.remaining_weight ?? 0,
    (attributes?.weight_unit ?? "kg") as "kg" | "g",
  );
  const prefilledWeightInGrams = toGrams(
    attributes?.prefilled_items_total_weight ?? 0,
    (attributes?.weight_unit ?? "kg") as "kg" | "g",
  );
  const planWeightInGrams = toGrams(
    attributes?.weight ?? 0,
    (attributes?.weight_unit ?? "kg") as "kg" | "g",
  );
  const selectedWeight = items.reduce(
    (total, item) => total + item.gram_weight * item.qty,
    0,
  );
  const totalBoxWeight = prefilledWeightInGrams + selectedWeight;
  const totalProgress = planWeightInGrams
    ? Math.min(100, (totalBoxWeight / planWeightInGrams) * 100)
    : 0;
  const buildProgress = remainingWeightInGrams
    ? Math.min(100, (selectedWeight / remainingWeightInGrams) * 100)
    : 100;
  const isComplete = selectedWeight === remainingWeightInGrams;
  const planName = attributes?.name ?? "Subscription Plan";
  const planWeight = `${attributes?.weight ?? 0}${attributes?.weight_unit ?? "kg"}`;
  const frequency = formatEnums(subInfo?.selectedFrequency ?? "weekly");
  const planPrice = displayCurrency(attributes?.price ?? 0, "NGN");
  const categoryColorMap = useMemo(() => {
    const colorMap: Record<string, (typeof CATEGORY_COLORS)[number]> = {};
    let colorIndex = 0;

    categories.forEach((category) => {
      if (category.value === "all") return;
      colorMap[category.value] =
        CATEGORY_COLORS[colorIndex % CATEGORY_COLORS.length];
      colorIndex += 1;
    });

    return colorMap;
  }, [categories]);

  useEffect(() => {
    if (!subInfo?.subscription || !subInfo?.selectedFrequency) {
      router.replace("/(onboarding)/Plans");
    }
  }, [subInfo]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await axiosClient.get<{
        data?: CategoryResponseItem[];
      }>("/product-categories/root");
      const data = response?.data?.data ?? [];

      setCategories([
        { id: "all", name: "All", value: "all" },
        ...data.map((item) => ({
          id: item?.id,
          name: item?.attributes?.name ?? "Unnamed category",
          value: item?.attributes?.slug ?? "other",
        })),
      ]);
    } catch {
      setCategories([{ id: "all", name: "All", value: "all" }]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const fetchProducts = useCallback(
    async (requestedPage: number, replace: boolean) => {
      if (remainingWeightInGrams <= 0) {
        setProducts([]);
        return false;
      }

      try {
        replace ? setLoadingProducts(true) : setLoadingMore(true);
        setProductError(false);
        let url = `/products?page=${requestedPage}&limit=30`;

        if (activeCategory !== "all") {
          url += `&categorySlug=${encodeURIComponent(activeCategory)}`;
        }
        const response = await axiosClient.get<{
          data?: ProductResponseItem[];
          meta?: ProductMeta;
        }>(url);
        const nextProducts = (response?.data?.data ?? []).map(mapProduct);

        setProducts((current) =>
          replace ? nextProducts : [...current, ...nextProducts],
        );
        setMeta(response?.data?.meta ?? null);
        return true;
      } catch {
        setProductError(true);
        if (replace) setProducts([]);
        return false;
      } finally {
        setLoadingProducts(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, remainingWeightInGrams],
  );

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setPage(1);
    void fetchProducts(1, true);
  }, [fetchProducts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await Promise.all([fetchCategories(), fetchProducts(1, true)]);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    const totalPages = meta?.totalPages ?? 1;
    if (
      loadingProducts ||
      loadingMoreRef.current ||
      page >= totalPages
    ) {
      return;
    }

    loadingMoreRef.current = true;
    const nextPage = page + 1;
    const loaded = await fetchProducts(nextPage, false);
    if (loaded) setPage(nextPage);
    loadingMoreRef.current = false;
  };

  const changeCategory = (category: CategoryFilter) => {
    setActiveCategory(category);
    setPage(1);
  };

  const handleIncrementProduct = useCallback(
    (product: CatalogProduct) => {
      const result = add(product);
      if (!result.success) toast.show(result.message ?? "Unable to add item.");
    },
    [add, toast],
  );

  const handleDecrementProduct = useCallback(
    (product: CatalogProduct) => {
      const quantity = items.find((item) => item.id === product.id)?.qty ?? 0;
      setQty(product, quantity - 1);
    },
    [items, setQty],
  );

  const renderItem = useCallback(
    ({ item }: CatalogProductListItemProps) => {
      const quantity = items.find((product) => product.id === item.id)?.qty ?? 0;
      return (
        <CatalogProductCard
          item={item}
          quantity={quantity}
          categoryBackgroundColor={
            (categoryColorMap[item.categorySlug ?? ""] ?? CATEGORY_COLORS[0])
              .background
          }
          categoryTextColor={
            (categoryColorMap[item.categorySlug ?? ""] ?? CATEGORY_COLORS[0])
              .text
          }
          highlightWhenSelected
          canIncrement={
            selectedWeight + item.weightInGrams <= remainingWeightInGrams
          }
          onDecrement={handleDecrementProduct}
          onIncrement={handleIncrementProduct}
        />
      );
    },
    [
      handleDecrementProduct,
      handleIncrementProduct,
      items,
      categoryColorMap,
      remainingWeightInGrams,
      selectedWeight,
    ],
  );

  const handleContinue = () => {
    summaryModalRef.current?.dismiss();
    const boxSelections = Object.fromEntries(
      items.map((item) => [item.id, item.qty]),
    );
    router.push({
      pathname: "/(onboarding)/AddOns",
      params: { boxSelections: JSON.stringify(boxSelections) },
    });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setOverlayActive(
      event.nativeEvent.contentOffset.y >= stickySectionOffsetY.current,
    );
  };

  const renderListHeader = () => (
    <View>
      <View className="flex-row items-start justify-between gap-3 px-4 pb-4">
        <View className="flex-1">
          <Text className="font-mbold text-[28px] leading-9 text-[#292929]">
            {requiredCategoryName
              ? `Choose Your ${requiredCategoryName}`
              : "Build Your Box"}
          </Text>
          <Text className="mt-1 font-mregular text-sm text-gray">
            {requiredCategoryName
              ? `Choose your ${requiredCategoryName.toLowerCase()} and mix until ${formatWeight(remainingWeightInGrams)} is filled.`
              : `Fill the remaining ${formatWeight(remainingWeightInGrams)} from this catalog.`}
          </Text>
        </View>
        <View className="rounded-full bg-green-light px-3 py-2">
          <Text className="font-msbold text-xs text-green">
            {isComplete
              ? "Complete!"
              : `${formatWeight(selectedWeight)} / ${formatWeight(remainingWeightInGrams)}`}
          </Text>
        </View>
      </View>

      <View
        onLayout={(event) => {
          stickySectionOffsetY.current = event.nativeEvent.layout.y;
        }}
      >
        <StickyControls
          activeCategory={activeCategory}
          categories={categories}
          onCategoryChange={changeCategory}
          progressPercent={buildProgress}
          remainingWeight={remainingWeightInGrams}
          selectedWeight={selectedWeight}
        />
      </View>
    </View>
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
          rightContent={<CartHeaderButton />}
        />
      </View>

      <View className="relative flex-1">
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          extraData={items}
          ListHeaderComponent={renderListHeader}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            loadingProducts || loadingCategories ? (
              <ActivityIndicator className="my-16" color="#218225" />
            ) : remainingWeightInGrams <= 0 ? (
              <Text className="my-16 px-4 text-center font-mregular text-gray">
                This plan is already fully prefilled.
              </Text>
            ) : (
              <Text className="my-16 px-4 text-center font-mregular text-gray">
                {productError ? "Couldn't load products." : "No products found."}
              </Text>
            )
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="h-20 items-center justify-center gap-2">
                <ActivityIndicator size="small" color="#218225" />
                <Text className="font-mregular text-xs text-gray">
                  Loading more products...
                </Text>
              </View>
            ) : null
          }
          onEndReached={() => void handleLoadMore()}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ gap: 14, paddingTop: 4, paddingBottom: 16 }}
        />

        <View
          pointerEvents={overlayActive ? "box-none" : "none"}
          className="absolute inset-x-0 top-0 z-20 bg-background"
          style={{ opacity: overlayActive ? 1 : 0 }}
        >
          <StickyControls
            activeCategory={activeCategory}
            categories={categories}
            onCategoryChange={changeCategory}
            progressPercent={buildProgress}
            remainingWeight={remainingWeightInGrams}
            selectedWeight={selectedWeight}
          />
        </View>
      </View>

      <View className="px-4">
        <CustomButton
          title="Continue"
          handlePress={() => summaryModalRef.current?.present()}
          disableButton={!isComplete}
          containerStyles="mb-1 mt-2 w-full"
          textStyles="text-white"
        />
        {!isComplete && (
          <Text className="mb-1 mt-1 text-center font-mregular text-xs text-[#C58920]">
            Fill remaining {formatWeight(remainingWeightInGrams - selectedWeight)}
            {" of "}
            {formatWeight(remainingWeightInGrams)} to continue
          </Text>
        )}
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

          <BottomSheetFlatList
            data={items}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
            ListHeaderComponent={
              <>
                <Text className="font-mbold text-3xl">Your Box</Text>

                <View className="mt-3 rounded-2xl bg-white p-4">
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

                {(attributes?.prefilled_items?.length ?? 0) > 0 && (
                  <View className="mt-3 rounded-2xl bg-white p-4">
                    <Text className="mb-4 font-mbold text-xl text-[#292929]">
                      In your box
                    </Text>
                    {attributes?.prefilled_items?.map((item, index) => (
                      <SpaceBetween
                        key={item?.product_id}
                        title={item?.name}
                        value={`${item?.weight}${item?.weight_unit}${
                          (item?.quantity ?? 0) > 1
                            ? ` X (${item?.quantity})`
                            : ""
                        }`}
                        containerStyles={index === 0 ? "" : "mt-4"}
                        titleStyles="flex-1 text-gray"
                      />
                    ))}
                  </View>
                )}

                <View className="mt-3 rounded-t-2xl bg-white px-4 pt-4">
                  <Text className="mb-4 font-mbold text-xl text-green">
                    Your picks
                  </Text>
                </View>
              </>
            }
            renderItem={({ item, index }) => (
              <View
                className={`bg-white px-4 ${
                  index === items.length - 1 ? "rounded-b-2xl pb-5" : ""
                }`}
              >
                <SpaceBetween
                  title={item.qty > 1 ? `${item.name} x ${item.qty}` : item.name}
                  value={formatWeight(item.gram_weight * item.qty)}
                  containerStyles={index === 0 ? "" : "mt-4"}
                  titleStyles="flex-1 text-gray"
                />
              </View>
            )}
            ListEmptyComponent={
              <View className="rounded-b-2xl bg-white px-4 pb-4">
                <Text className="font-mregular text-base text-gray">
                  No additional cuts selected yet.
                </Text>
              </View>
            }
            ListFooterComponent={
              <View className="mt-3 rounded-2xl bg-white p-4">
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
            }
          />

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
