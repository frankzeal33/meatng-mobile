import CustomButton from "@/components/CustomButton";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { catalogProducts } from "@/data/meatCatalog";
import type {
  CatalogProduct,
  EditableProductRowProps,
  QuantityControlProps,
} from "@/types/catalog";
import type { ReviewCartRouteParams } from "@/types/onboarding";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TARGET_WEIGHT = 5000;

const mandatoryCuts = [
  { id: "boneless-beef", name: "Boneless Beef", weight: "1kg", quantity: 2 },
  {
    id: "boneless-beef-500",
    name: "Boneless Beef (500g)",
    weight: "500g",
    quantity: 1,
  },
  { id: "bone-in-beef", name: "Bone in Beef", weight: "1kg", quantity: 1 },
  { id: "whole-chicken", name: "Whole Chicken", weight: "1.5kg", quantity: 1 },
];

function parseSelections(value?: string): Record<string, number> {
  if (!value) return {};

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, quantity]) => typeof quantity === "number" && quantity > 0,
      ),
    );
  } catch {
    return {};
  }
}

function parsePrice(value: string) {
  return Number.parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
}

function formatPrice(value: number) {
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const QuantityControl = memo(function QuantityControl({
  item,
  quantity,
  canIncrement = true,
  onDecrement,
  onIncrement,
}: QuantityControlProps) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${item.name} quantity`}
        onPress={() => onDecrement(item)}
        className="size-8 items-center justify-center rounded border border-gray-300 bg-white active:bg-gray-100"
      >
        <Ionicons name="remove" size={17} color="#292929" />
      </Pressable>
      <Text className="min-w-5 text-center font-msbold text-xs">
        {quantity}x
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${item.name} quantity`}
        disabled={!canIncrement}
        onPress={() => onIncrement(item)}
        className={`size-8 items-center justify-center rounded bg-green ${
          canIncrement ? "active:opacity-80" : "opacity-40"
        }`}
      >
        <Ionicons name="add" size={17} color="#FFFFFF" />
      </Pressable>
    </View>
  );
});

const EditableProductRow = memo(function EditableProductRow({
  item,
  quantity,
  detail,
  canIncrement,
  onDecrement,
  onIncrement,
}: EditableProductRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1">
        <Text className="font-mregular text-base text-[#3A3A3A]">
          {item.name}
        </Text>
        <Text className="mt-0.5 font-mregular text-base text-gray">
          {detail}
        </Text>
      </View>
      <QuantityControl
        item={item}
        quantity={quantity}
        canIncrement={canIncrement}
        onDecrement={onDecrement}
        onIncrement={onIncrement}
      />
    </View>
  );
});

export default function ReviewCart() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<ReviewCartRouteParams>();
  const [boxQuantities, setBoxQuantities] = useState<Record<string, number>>(
    () => parseSelections(params.boxSelections),
  );
  const [addOnQuantities, setAddOnQuantities] = useState<
    Record<string, number>
  >(() => parseSelections(params.addOnSelections));

  const customPicks = useMemo(
    () =>
      catalogProducts.filter((product) => (boxQuantities[product.id] ?? 0) > 0),
    [boxQuantities],
  );
  const optionalExtras = useMemo(
    () =>
      catalogProducts.filter(
        (product) => (addOnQuantities[product.id] ?? 0) > 0,
      ),
    [addOnQuantities],
  );
  const selectedWeight = useMemo(
    () =>
      catalogProducts.reduce(
        (total, product) =>
          total + product.weightInGrams * (boxQuantities[product.id] ?? 0),
        0,
      ),
    [boxQuantities],
  );
  const progressPercent = Math.min(100, (selectedWeight / TARGET_WEIGHT) * 100);
  const planPrice = parsePrice(params.price ?? "₦70,000.00");
  const addOnsPrice = useMemo(
    () =>
      catalogProducts.reduce(
        (total, product) =>
          total +
          parsePrice(product.price) * (addOnQuantities[product.id] ?? 0),
        0,
      ),
    [addOnQuantities],
  );
  const totalPrice = planPrice + addOnsPrice;

  const incrementBoxProduct = useCallback((product: CatalogProduct) => {
    setBoxQuantities((current) => {
      const currentWeight = catalogProducts.reduce(
        (total, item) => total + item.weightInGrams * (current[item.id] ?? 0),
        0,
      );
      if (currentWeight + product.weightInGrams > TARGET_WEIGHT) return current;

      return { ...current, [product.id]: (current[product.id] ?? 0) + 1 };
    });
  }, []);

  const decrementProduct = useCallback(
    (setter: typeof setBoxQuantities, product: CatalogProduct) => {
      setter((current) => {
        const quantity = current[product.id] ?? 0;
        if (quantity <= 1) {
          const { [product.id]: _removed, ...remaining } = current;
          return remaining;
        }
        return { ...current, [product.id]: quantity - 1 };
      });
    },
    [],
  );

  const incrementAddOn = useCallback((product: CatalogProduct) => {
    setAddOnQuantities((current) => ({
      ...current,
      [product.id]: (current[product.id] ?? 0) + 1,
    }));
  }, []);

  const handleCheckout = useCallback(() => {
    router.push({
      pathname: "/(onboarding)/Checkout",
      params: {
        planName: params.planName ?? "Signature Box",
        weight: params.weight ?? "10kg",
        frequency: params.frequency ?? "Weekly",
        price: formatPrice(planPrice),
        boxSelections: JSON.stringify(boxQuantities),
        addOnSelections: JSON.stringify(addOnQuantities),
        addOnsPrice: formatPrice(addOnsPrice),
        total: formatPrice(totalPrice),
      },
    });
  }, [
    addOnQuantities,
    addOnsPrice,
    boxQuantities,
    params,
    planPrice,
    totalPrice,
  ]);

  return (
    <View
      className="flex-1 bg-background px-4"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StatusBar style="dark" />
      <SpaceBetweenHeader onBackPress={() => router.back()} showRight={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
      >
        <Text className="font-mbold text-3xl">
          Review Cart & Optional Extras
        </Text>
        <Text className="mt-2 font-mregular text-base leading-6 text-gray">
          Confirm your picks and addons for this cycle.
        </Text>

        <View className="mt-4 rounded-2xl bg-white p-6">
          <View className="flex-row items-center justify-between">
            <Text className="font-mregular text-base">Your Box Contents</Text>
            <Text className="font-mregular text-base">
              {selectedWeight / 1000}kg/{TARGET_WEIGHT / 1000}kg
            </Text>
          </View>
          <View className="mt-4 h-3 overflow-hidden rounded-full bg-green-light">
            <View
              className="h-full rounded-full bg-green"
              style={{ width: `${progressPercent}%` }}
            />
          </View>

          <Text className="mt-7 font-mbold text-xl text-green">
            Mandatory Cuts
          </Text>
          <View className="mt-3 gap-3">
            {mandatoryCuts.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center justify-between gap-3"
              >
                <View className="flex-1">
                  <Text className="font-mregular text-base text-[#3A3A3A]">
                    {item.name}
                  </Text>
                  <Text className="mt-0.5 font-mregular text-base text-gray">
                    {item.weight}
                  </Text>
                </View>
                <View className="min-w-8 items-center rounded-full border border-gray-300 px-2 py-1">
                  <Text className="font-msbold text-xs">{item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text className="mt-8 font-mbold text-xl text-green">
            Your Custom Picks
          </Text>
          <View className="mt-3">
            {customPicks.length > 0 ? (
              <FlatList
                data={customPicks}
                keyExtractor={(product) => product.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View className="h-4" />}
                renderItem={({ item: product }) => {
                  const quantity = boxQuantities[product.id] ?? 0;
                  return (
                    <EditableProductRow
                      item={product}
                      detail={product.weightLabel}
                      quantity={quantity}
                      canIncrement={
                        selectedWeight + product.weightInGrams <= TARGET_WEIGHT
                      }
                      onDecrement={(item) =>
                        decrementProduct(setBoxQuantities, item)
                      }
                      onIncrement={incrementBoxProduct}
                    />
                  );
                }}
              />
            ) : (
              <Text className="font-mregular text-base text-gray">
                No custom picks selected.
              </Text>
            )}
          </View>

          {optionalExtras.length > 0 && (
            <>
              <Text className="mt-8 font-mbold text-xl text-green">
                Optional Extras (Addons)
              </Text>
              <FlatList
                data={optionalExtras}
                keyExtractor={(product) => product.id}
                scrollEnabled={false}
                className="mt-3"
                ItemSeparatorComponent={() => <View className="h-4" />}
                renderItem={({ item: product }) => (
                  <EditableProductRow
                    item={product}
                    detail={product.price}
                    quantity={addOnQuantities[product.id] ?? 0}
                    onDecrement={(item) =>
                      decrementProduct(setAddOnQuantities, item)
                    }
                    onIncrement={incrementAddOn}
                  />
                )}
              />
            </>
          )}
        </View>

        <View className="mt-4 rounded-2xl bg-white p-6">
          <SpaceBetween
            title="Plan price"
            value={formatPrice(planPrice)}
            titleStyles="text-lg text-gray"
            valueStyles="text-lg text-[#292929]"
          />
          <SpaceBetween
            title="Add-ons"
            value={formatPrice(addOnsPrice)}
            containerStyles="mt-4"
            titleStyles="text-lg text-gray"
            valueStyles="text-lg text-[#292929]"
          />
          <View className="my-5 h-px bg-gray-200" />
          <SpaceBetween
            title="Total"
            value={formatPrice(totalPrice)}
            titleStyles="font-mbold text-xl text-[#292929]"
            valueStyles="font-mbold text-xl text-green"
          />
        </View>
      </ScrollView>

      <CustomButton
        title="Continue"
        handlePress={handleCheckout}
        containerStyles="mb-1 mt-2 w-full"
        textStyles="text-white"
      />
    </View>
  );
}
