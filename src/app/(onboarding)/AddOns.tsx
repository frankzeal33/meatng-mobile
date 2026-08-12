import CatalogCategories from "@/components/CatalogCategories";
import CatalogProductCard from "@/components/CatalogProductCard";
import CartHeaderButton from "@/components/CartHeaderButton";
import CustomButton from "@/components/CustomButton";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { axiosClient } from "@/globalApi";
import { useAddonStore } from "@/store/addonStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import type {
  AddOnCategoriesProps,
  CatalogCategoryOption,
  CatalogProduct,
  CatalogProductListItemProps,
  CategoryFilter,
} from "@/types/catalog";
import { toGrams } from "@/utils/conversion";
import displayCurrency from "@/utils/displayCurrency";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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
  const attributes = item.attributes;
  const category = item.relationships?.categoryDetails?.data?.[0];
  const weight = attributes?.mainValue ?? 0;
  const weightUnit = attributes?.unit ?? "g";
  const priceValue = attributes?.price ?? 0;

  return {
    id: item.id,
    name: attributes?.name ?? "Unnamed product",
    image: attributes?.image ?? "",
    price: displayCurrency(priceValue, "NGN"),
    priceValue,
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

const AddOnCategories = memo(function AddOnCategories({
  activeCategory,
  categories,
  onCategoryChange,
}: AddOnCategoriesProps) {
  return (
    <View className="bg-background">
      <Text className="px-4 font-mbold text-sm">Categories</Text>
      <CatalogCategories
        activeCategory={activeCategory}
        categories={categories}
        onCategoryChange={onCategoryChange}
      />
    </View>
  );
});

export default function AddOns() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const subInfo = useSubscriptionStore((state) => state.subInfo);
  const addonItems = useAddonStore((state) => state.addonItems);
  const addAddon = useAddonStore((state) => state.addAddon);
  const setAddonQty = useAddonStore((state) => state.setAddonQty);
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
    if (!subInfo?.subscription || !subInfo.selectedFrequency) {
      router.replace("/(onboarding)/Plans");
    }
  }, [subInfo]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await axiosClient.get<{
        data?: CategoryResponseItem[];
      }>("/product-categories/root");
      const data = response.data?.data ?? [];

      setCategories([
        { id: "all", name: "All", value: "all" },
        ...data.map((item) => ({
          id: item.id,
          name: item.attributes?.name ?? "Unnamed category",
          value: item.attributes?.slug ?? "other",
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
        const nextProducts = (response.data?.data ?? []).map(mapProduct);

        setProducts((current) =>
          replace ? nextProducts : [...current, ...nextProducts],
        );
        setMeta(response.data?.meta ?? null);
        return true;
      } catch (error: any) {
        setProductError(true);
        if (replace) setProducts([]);
        toast.show(
          error?.response?.data?.message ?? "Couldn't load add-ons.",
        );
        return false;
      } finally {
        setLoadingProducts(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, toast],
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
    if (loadingProducts || loadingMoreRef.current || page >= totalPages) return;

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

  const handleIncrementProduct = (product: CatalogProduct) => {
    addAddon(product);
  };

  const handleDecrementProduct = (product: CatalogProduct) => {
    const quantity =
      addonItems.find((item) => item.id === product.id)?.qty ?? 0;
    setAddonQty(product, quantity - 1);
  };

  const renderItem = ({ item }: CatalogProductListItemProps) => {
    const quantity =
      addonItems.find((product) => product.id === item.id)?.qty ?? 0;
    const colors =
      categoryColorMap[item.categorySlug ?? ""] ?? CATEGORY_COLORS[0];

    return (
      <CatalogProductCard
        item={item}
        quantity={quantity}
        categoryBackgroundColor={colors.background}
        categoryTextColor={colors.text}
        highlightWhenSelected
        onDecrement={handleDecrementProduct}
        onIncrement={handleIncrementProduct}
      />
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setOverlayActive(
      event.nativeEvent.contentOffset.y >= stickySectionOffsetY.current,
    );
  };

  const renderListHeader = () => (
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
        onLayout={(event) => {
          stickySectionOffsetY.current = event.nativeEvent.layout.y;
        }}
      >
        <AddOnCategories
          activeCategory={activeCategory}
          categories={categories}
          onCategoryChange={changeCategory}
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
          extraData={addonItems}
          ListHeaderComponent={renderListHeader}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            loadingProducts || loadingCategories ? (
              <ActivityIndicator className="my-16" color="#218225" />
            ) : (
              <Text className="my-16 px-4 text-center font-mregular text-gray">
                {productError ? "Couldn't load add-ons." : "No add-ons found."}
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
          <AddOnCategories
            activeCategory={activeCategory}
            categories={categories}
            onCategoryChange={changeCategory}
          />
        </View>
      </View>

      <View className="px-4">
        <CustomButton
          title="Review Cart"
          handlePress={() => router.push("/(onboarding)/ReviewCart")}
          containerStyles="mb-1 mt-2 w-full"
          textStyles="text-white"
        />
      </View>
    </View>
  );
}
