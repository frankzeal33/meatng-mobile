import CustomButton from "@/components/CustomButton";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import type { AddonItem } from "@/store/addonStore";
import { useAddonStore } from "@/store/addonStore";
import type { CartItem } from "@/store/cartStore";
import { useCartStore } from "@/store/cartStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { formatWeight, toGrams } from "@/utils/conversion";
import displayCurrency from "@/utils/displayCurrency";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

type QuantityControlProps = {
  name: string;
  quantity: number;
  canIncrement?: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
};

function QuantityControl({
  name,
  quantity,
  canIncrement = true,
  onDecrement,
  onIncrement,
}: QuantityControlProps) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${name} quantity`}
        onPress={onDecrement}
        className="size-8 items-center justify-center rounded border border-gray-300 bg-white active:bg-gray-100"
      >
        <Ionicons name="remove" size={17} color="#292929" />
      </Pressable>
      <Text className="min-w-5 text-center font-msbold text-xs">
        {quantity}x
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Increase ${name} quantity`}
        disabled={!canIncrement}
        onPress={onIncrement}
        className={`size-8 items-center justify-center rounded bg-green ${
          canIncrement ? "active:opacity-80" : "opacity-40"
        }`}
      >
        <Ionicons name="add" size={17} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

type EditableProductRowProps = {
  name: string;
  detail: string;
  quantity: number;
  canIncrement?: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
};

function EditableProductRow({
  name,
  detail,
  quantity,
  canIncrement,
  onDecrement,
  onIncrement,
}: EditableProductRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1">
        <Text className="font-mregular text-base">{name}</Text>
        <Text className="mt-0.5 font-mregular text-base text-gray">
          {detail}
        </Text>
      </View>
      <QuantityControl
        name={name}
        quantity={quantity}
        canIncrement={canIncrement}
        onDecrement={onDecrement}
        onIncrement={onIncrement}
      />
    </View>
  );
}

export default function ReviewCart() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const subInfo = useSubscriptionStore((state) => state.subInfo);
  const items = useCartStore((state) => state.items);
  const setQty = useCartStore((state) => state.setQty);
  const addonItems = useAddonStore((state) => state.addonItems);
  const setAddonQty = useAddonStore((state) => state.setAddonQty);
  const attributes = subInfo?.subscription?.attributes;
  const prefilledItems = attributes?.prefilled_items ?? [];
  const remainingWeight = toGrams(
    attributes?.remaining_weight ?? 0,
    (attributes?.weight_unit ?? "kg") as "kg" | "g",
  );
  const selectedWeight = items.reduce(
    (total, item) => total + item.gram_weight * item.qty,
    0,
  );
  const progressPercent = remainingWeight
    ? Math.min(100, (selectedWeight / remainingWeight) * 100)
    : 100;
  const isBoxComplete =
    Boolean(subInfo?.subscription) && selectedWeight === remainingWeight;
  const planPrice = attributes?.price ?? 0;
  const addOnsPrice = addonItems.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );
  const totalPrice = planPrice + addOnsPrice;

  useEffect(() => {
    if (!subInfo?.subscription || !subInfo.selectedFrequency) {
      router.replace("/(onboarding)/Plans");
    }
  }, [subInfo]);

  const incrementCartItem = (item: CartItem) => {
    const result = setQty(item, item.qty + 1);
    if (!result.success) {
      toast.show(result.message ?? "Unable to update item.");
    }
  };

  const decrementCartItem = (item: CartItem) => {
    setQty(item, item.qty - 1);
  };

  const incrementAddon = (item: AddonItem) => {
    setAddonQty(item, item.qty + 1);
  };

  const decrementAddon = (item: AddonItem) => {
    setAddonQty(item, item.qty - 1);
  };

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
        <Text className="font-mbold text-2xl">
          Review Cart & Optional Extras
        </Text>
        <Text className="mt-2 font-mregular text-base leading-6 text-gray">
          Confirm your picks and addons for this cycle.
        </Text>

        <View className="mt-4 rounded-2xl bg-white p-4">
          <View className="flex-row items-center justify-between gap-4">
            <Text className="flex-1 font-mregular text-base">
              Your Box Contents
            </Text>
            <Text className="font-mregular text-base">
              {formatWeight(selectedWeight)}/{formatWeight(remainingWeight)}
            </Text>
          </View>
          <View className="mt-4 h-3 overflow-hidden rounded-full bg-green-light">
            <View
              className="h-full rounded-full bg-green"
              style={{ width: `${progressPercent}%` }}
            />
          </View>

          {prefilledItems.length > 0 && (
            <>
              <Text className="mt-6 font-mbold text-lg text-green">
                Mandatory Cuts (prefilled)
              </Text>
              <View className="mt-3 gap-3">
                {prefilledItems.map((item) => (
                  <View
                    key={item.product_id}
                    className="flex-row items-center justify-between gap-3"
                  >
                    <View className="flex-1">
                      <Text className="font-mregular text-base text-[#3A3A3A]">
                        {item.name}
                      </Text>
                      <Text className="mt-0.5 font-mregular text-base text-gray">
                        {item.weight}{item.weight_unit}
                      </Text>
                    </View>
                    <View className="min-w-8 items-center rounded-full border border-gray-300 px-2 py-1">
                      <Text className="font-msbold text-xs">
                        {item.quantity}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text className="mt-6 font-mbold text-lg text-green">
            Your Custom Picks
          </Text>
          {!isBoxComplete && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back to Build Your Box"
              onPress={() => router.push("/(onboarding)/BuildYourBox")}
              className="mt-2 flex-row items-center gap-2 self-start py-1 active:opacity-70"
            >
              <Ionicons name="arrow-back" size={16} color="#DC2626" />
              <Text className="font-msbold text-xs text-red-600">
                Go back to complete your box
              </Text>
            </Pressable>
          )}
          <View className="mt-3 gap-4">
            {items.length > 0 ? (
              items.map((item) => (
                <EditableProductRow
                  key={item.id}
                  name={item.name}
                  detail={formatWeight(item.gram_weight * item.qty)}
                  quantity={item.qty}
                  canIncrement={
                    selectedWeight + item.weightInGrams <= remainingWeight
                  }
                  onDecrement={() => decrementCartItem(item)}
                  onIncrement={() => incrementCartItem(item)}
                />
              ))
            ) : (
              <Text className="font-mregular text-base text-gray">
                No custom picks selected.
              </Text>
            )}
          </View>

          {addonItems.length > 0 && (
            <>
              <Text className="mt-6 font-mbold text-lg text-green">
                Optional Extras (Addons)
              </Text>
              <View className="mt-3 gap-4">
                {addonItems.map((item) => (
                  <EditableProductRow
                    key={item.id}
                    name={item.name}
                    detail={displayCurrency(item.price, "NGN")}
                    quantity={item.qty}
                    onDecrement={() => decrementAddon(item)}
                    onIncrement={() => incrementAddon(item)}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        <View className="mt-4 rounded-2xl bg-white p-4">
          <SpaceBetween
            title="Plan price"
            value={displayCurrency(planPrice, "NGN")}
            titleStyles="text-lg text-gray"
            valueStyles="text-lg"
          />
          <SpaceBetween
            title="Add-ons"
            value={displayCurrency(addOnsPrice, "NGN")}
            containerStyles="mt-4"
            titleStyles="text-lg text-gray"
            valueStyles="text-lg"
          />
          <View className="my-5 h-px bg-gray-200" />
          <SpaceBetween
            title="Total"
            value={displayCurrency(totalPrice, "NGN")}
            titleStyles="font-mbold text-xl text-[#292929]"
            valueStyles="font-mbold text-xl text-green"
          />
        </View>
      </ScrollView>

      <CustomButton
        title="Continue"
        handlePress={() => router.push("/(onboarding)/Checkout")}
        disableButton={!isBoxComplete}
        containerStyles="mb-1 mt-2 w-full"
        textStyles="text-white"
      />
      {!isBoxComplete && (
        <Text className="mb-1 mt-1 text-center font-mregular text-xs text-[#C58920]">
          Your box needs {formatWeight(remainingWeight - selectedWeight)} to
          continue
        </Text>
      )}
    </View>
  );
}
