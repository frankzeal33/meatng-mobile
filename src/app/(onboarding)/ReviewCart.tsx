import CustomButton from "@/components/CustomButton";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { axiosClient } from "@/globalApi";
import type { AddonItem } from "@/store/addonStore";
import { useAddonStore } from "@/store/addonStore";
import { useAuthStore } from "@/store/AuthStore";
import type { CartItem } from "@/store/cartStore";
import { useCartStore } from "@/store/cartStore";
import { useProfileStore } from "@/store/ProfileStore";
import type { PrefilledItem } from "@/store/subscriptionStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { formatWeight, toGrams } from "@/utils/conversion";
import displayCurrency from "@/utils/displayCurrency";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, SectionList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";
import {
  hideLoader,
  showLoader,
  useIsLoading,
} from "@/store/LoaderStore";

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

type ReviewCartRow =
  | { type: "prefilled"; id: string; item: PrefilledItem }
  | { type: "custom"; id: string; item: CartItem }
  | { type: "addon"; id: string; item: AddonItem };

type ReviewCartSection = {
  type: ReviewCartRow["type"];
  title: string;
  data: ReviewCartRow[];
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
  const isLoading = useIsLoading();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const email = useProfileStore((state) => state.userProfile.email);
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
  const sections: ReviewCartSection[] = [
    {
      type: "prefilled",
      title: "Mandatory Cuts (prefilled)",
      data: prefilledItems.map((item) => ({
        type: "prefilled",
        id: item.product_id,
        item,
      })),
    },
    {
      type: "custom",
      title: "Your Custom Picks",
      data: items.map((item) => ({ type: "custom", id: item.id, item })),
    },
    {
      type: "addon",
      title: "Optional Extras (Addons)",
      data: addonItems.map((item) => ({ type: "addon", id: item.id, item })),
    },
  ];

  useFocusEffect(
    useCallback(() => {
      if (!subInfo?.subscription || !subInfo.selectedFrequency) {
        router.replace("/(onboarding)/Plans");
      }
    }, [subInfo]),
  );

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

  const continueToCheckout = async () => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/(onboarding)/Register");
      return;
    }

    if (!subInfo?.subscription?.id || !email) {
      toast.show(
        !email
          ? "Your email is unavailable. Please sign in again."
          : "Please select a subscription plan again.",
        { type: "danger" },
      );
      return;
    }

    const cartItems = [...items, ...addonItems].map((item) => ({
      productId: item.id,
      quantity: item.qty,
      itemType: item.item_type,
    }));

    try {
      showLoader();
      await axiosClient.post("/carts/items", {
        email,
        planId: subInfo.subscription.id,
        items: cartItems,
      });
      router.push("/(onboarding)/Checkout");
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ??
          "Unable to save your cart. Please try again.",
        { type: "danger" },
      );
    } finally {
      hideLoader();
    }
  };

  return (
    <View
      className="flex-1 bg-background px-4"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StatusBar style="dark" />
      <SpaceBetweenHeader onBackPress={() => router.back()} showRight={false} />

      <SectionList
        sections={sections}
        keyExtractor={(row) => `${row.type}-${row.id}`}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        ListHeaderComponent={
          <>
            <Text className="font-mbold text-2xl">
              Review Cart & Optional Extras
            </Text>
            <Text className="mt-2 font-mregular text-base leading-6 text-gray">
              Confirm your picks and addons for this cycle.
            </Text>

            <View className="mt-4 rounded-t-2xl bg-white px-4 pt-4">
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

            </View>
          </>
        }
        renderSectionHeader={({ section }) => {
          if (section.data.length === 0 && section.type !== "custom") {
            return null;
          }

          return (
            <View className="bg-white px-4 pt-6">
              <Text className="font-mbold text-lg text-green">
                {section.title}
              </Text>
              {section.type === "custom" && !isBoxComplete && (
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
            </View>
          );
        }}
        renderItem={({ item: row, index }) => {
          if (row.type === "prefilled") {
            return (
              <View className="flex-row items-center justify-between gap-3 bg-white px-4 pt-3">
                <View className="flex-1">
                  <Text className="font-mregular text-base text-[#3A3A3A]">
                    {row.item.name}
                  </Text>
                  <Text className="mt-0.5 font-mregular text-base text-gray">
                    {row.item.weight}{row.item.weight_unit}
                  </Text>
                </View>
                <View className="min-w-8 items-center rounded-full border border-gray-300 px-2 py-1">
                  <Text className="font-msbold text-xs">
                    {row.item.quantity}
                  </Text>
                </View>
              </View>
            );
          }

          if (row.type === "custom") {
            return (
              <View
                className={`bg-white px-4 ${index === 0 ? "pt-3" : "pt-4"}`}
              >
                <EditableProductRow
                  name={row.item.name}
                  detail={formatWeight(row.item.gram_weight * row.item.qty)}
                  quantity={row.item.qty}
                  canIncrement={
                    selectedWeight + row.item.weightInGrams <= remainingWeight
                  }
                  onDecrement={() => decrementCartItem(row.item)}
                  onIncrement={() => incrementCartItem(row.item)}
                />
              </View>
            );
          }

          return (
            <View
              className={`bg-white px-4 ${index === 0 ? "pt-3" : "pt-4"}`}
            >
              <EditableProductRow
                name={row.item.name}
                detail={displayCurrency(row.item.price, "NGN")}
                quantity={row.item.qty}
                onDecrement={() => decrementAddon(row.item)}
                onIncrement={() => incrementAddon(row.item)}
              />
            </View>
          );
        }}
        renderSectionFooter={({ section }) =>
          section.type === "custom" && section.data.length === 0 ? (
            <View className="bg-white px-4 pt-3">
              <Text className="font-mregular text-base text-gray">
                No custom picks selected.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <>
            <View className="rounded-b-2xl bg-white px-4 pb-4" />

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
          </>
        }
      />

      <CustomButton
        title="Continue"
        handlePress={continueToCheckout}
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
