import CustomButtomSheet from "@/components/CustomButtomSheet";
import CartHeaderButton from "@/components/CartHeaderButton";
import CustomButton from "@/components/CustomButton";
import PlanCard from "@/components/PlanCard";
import RetryButton from "@/components/RetryButton";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { axiosClient } from "@/globalApi";
import { useAddonStore } from "@/store/addonStore";
import { useCartStore } from "@/store/cartStore";
import {
  type Plan as ApiPlanRecord,
  useSubscriptionStore,
} from "@/store/subscriptionStore";
import type { PlanType } from "@/types";
import type {
  DeliveryFrequency,
  DeliveryFrequencyListItemProps,
  PlanListItemProps,
  PlansScreenProps,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import displayCurrency from "@/utils/displayCurrency";

type ApiPlan = NonNullable<ApiPlanRecord>;
type PlanView = PlanType & { subscription: ApiPlan };

function toPlanCard(plan: ApiPlan): PlanView {
  const attributes = plan?.attributes;
  const fixedWeight = attributes?.prefilled_items_total_weight ?? 0;
  const remainingWeight = attributes?.remaining_weight ?? 0;
  const unit = attributes?.weight_unit ?? "kg";

  return {
    subscription: plan,
    id: plan?.id ?? "",
    isFeatured: attributes?.is_featured ?? false,
    name: attributes?.name ?? "Unnamed plan",
    type: attributes?.plan_type ?? "Standard",
    description: attributes?.description ?? "",
    price: displayCurrency(attributes?.price ?? 0, "NGN"),
    weight: `${attributes?.weight ?? 0}${unit} box`,
    breakdown: `${fixedWeight}${unit} fixed${
      remainingWeight > 0 ? ` + build ${remainingWeight}${unit}` : ""
    }`,
    image: attributes?.image
  };
}

const deliveryFrequencies: DeliveryFrequency[] = [
  {
    id: "weekly",
    title: "Weekly",
    description: "Perfect for regular restocks",
    billing: "Billed every week",
  },
  {
    id: "bi-weekly",
    title: "Bi-weekly",
    description: "Delivery every two weeks",
    billing: "Billed every 2 weeks",
  },
  {
    id: "monthly",
    title: "Monthly",
    description: "Best value for bulk shoppers",
    billing: "Billed once a month",
  },
];

export function PlansContent({ variant = "onboarding" }: PlansScreenProps) {
  const insets = useSafeAreaInsets();
  const isTab = variant === "tab";
  const snapPoints = useMemo(() => ["90%"], []);
  const frequencyModalRef = useRef<BottomSheetModal>(null);
  const summaryModalRef = useRef<BottomSheetModal>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedFrequency, setSelectedFrequency] =
    useState<DeliveryFrequency["id"]>("weekly");
  const selectedFrequencyDetails =
    deliveryFrequencies.find(
      (frequency) => frequency.id === selectedFrequency,
    ) ?? deliveryFrequencies[0];

  const { setSubInfo } = useSubscriptionStore();
  const { clearAddon } = useAddonStore();
  const clearCart = useCartStore((state) => state.clearCart);

  const [plans, setPlans] = useState<PlanView[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const selectedPlan =
    plans.find((plan) => plan?.id === selectedPlanId) ?? null;
  const selectedAttributes = selectedPlan?.subscription?.attributes;

  const handlePresentModalPress = useCallback(() => {
    frequencyModalRef.current?.present();
  }, []);

  const handleSelectPlan = useCallback(
    (plan: PlanType) => {
      setSelectedPlanId(plan.id);
      setSelectedFrequency("weekly");
      handlePresentModalPress();
    },
    [handlePresentModalPress],
  );

  const renderPlan = useCallback(
    ({ item }: PlanListItemProps) => (
      <PlanCard plan={item} onSelect={handleSelectPlan} />
    ),
    [handleSelectPlan],
  );

  const handleCloseModalPress = () => {
    frequencyModalRef.current?.dismiss();
  };

  const handlePresentSummary = () => {
    summaryModalRef.current?.present();
  };

  const handleCloseSummary = () => {
    summaryModalRef.current?.dismiss();
  };

  const handleContinueSummary = () => {
    summaryModalRef.current?.dismiss();
    frequencyModalRef.current?.dismiss();

    if (!selectedPlan) {
      return;
    }

    clearAddon();
    clearCart();
    setSubInfo({
      subscription: selectedPlan.subscription,
      selectedFrequency,
      source: variant,
    });

    router.push("/(onboarding)/PrebuiltBox");
  };

  useEffect(() => {
    void fetchPlans();
  }, []);

  const fetchPlans = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(false);

      const response = await axiosClient.get<{ data?: ApiPlan[] }>("/plans");
      const data = response?.data?.data ?? [];
      const transformedPlans = data.map(toPlanCard);

      setPlans(transformedPlans);

      if (transformedPlans.length > 0) {
        const featuredPlan = transformedPlans.find(
          (plan) => plan?.isFeatured,
        );
        const fallbackPlan =
          transformedPlans[Math.min(2, transformedPlans.length - 1)];
        const selected = featuredPlan ?? fallbackPlan;

        if (selected?.id) {
          setSelectedPlanId(String(selected.id));
        }
      }
    } catch {
      setError(true);
      setPlans([]);
      setSelectedPlanId(null);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPlans(false);
    setRefreshing(false);
  };

  const renderFrequency = useCallback(
    ({ item }: DeliveryFrequencyListItemProps) => {
      const isSelected = selectedFrequency === item.id;

      return (
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={`${item?.title}: ${item?.billing}`}
          onPress={() => setSelectedFrequency(item?.id)}
          className={`rounded-2xl border p-5 ${
            isSelected
              ? "border-green bg-green-lighter"
              : "border-transparent bg-white"
          }`}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={18} color="#218225" />
            <Text className="font-mbold text-xl text-[#292929]">
              {item?.title}
            </Text>
          </View>

          <Text className="mt-2 font-mregular text-lg text-gray">
            {item?.description}
          </Text>
          <Text className="mt-2 font-mregular text-lg text-green">
            {item?.billing}
          </Text>
        </Pressable>
      );
    },
    [selectedFrequency],
  );

  return (
    <View
      className="flex-1 bg-background px-4"
      style={{ paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      {!isTab && (
        <SpaceBetweenHeader
          onBackPress={() => router.back()}
          onRightPress={() => router.push("/(onboarding)/Gift")}
          rightLabel="Gift Someone"
        />
      )}

      {isTab && (
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-1 pr-3">
            <Text className="font-mbold text-xl">Plans</Text>
            <Text className="font-mregular text-sm text-gray">
              Choose the box that works for you.
            </Text>
          </View>
          <CartHeaderButton />
        </View>
      )}

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#218225" />
          <Text className="mt-2 font-mregular text-xs text-gray">
            Loading plans...
          </Text>
        </View>
      )}

      {!loading && (
        <FlatList
          data={plans}
          renderItem={renderPlan}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={() => void handleRefresh()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: plans.length === 0 ? 1 : undefined,
            paddingTop: isTab ? 16 : 12,
            paddingBottom: isTab ? 16 : insets.bottom + 12,
            gap: 16,
          }}
          ListHeaderComponent={
            plans.length > 0 ? (
              <View className="pb-2">
                {!isTab && (
                  <Text className="font-mbold text-2xl">
                    Pick a plan, build your box.
                  </Text>
                )}
                <Text className="font-mregular text-sm leading-5 text-gray">
                  {isTab
                    ? "Each plan comes pre-packed with quality cuts."
                    : "Each plan comes pre-packed with quality cuts. Choose your delivery frequency, then add optional extras on the next step."}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6">
              <Text className="font-mbold text-xl">
                {error ? "Couldn't load plans" : "No plans found"}
              </Text>
              <Text className="mt-2 text-center font-mregular text-sm text-gray">
                {error
                  ? "Something went wrong while fetching subscription plans. Please try again."
                  : "There are no subscription plans available right now. Please check back later."}
              </Text>
              <RetryButton
                onPress={() => void fetchPlans()}
                containerStyles="mt-5"
              />
            </View>
          }
        />
      )}

      <CustomButtomSheet
        ref={frequencyModalRef}
        snapPoints={snapPoints}
        enablePenDown={false}
        dynamicSizing={false}
        scrollable
      >
        <View className="h-full">
          <View className="mb-4 items-start">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close delivery frequency"
              onPress={handleCloseModalPress}
              className="size-12 items-center justify-center rounded-full bg-green-light"
            >
              <Ionicons name="arrow-back" size={22} color="#218225" />
            </Pressable>
          </View>

          <BottomSheetFlatList
            data={deliveryFrequencies}
            ListHeaderComponent={() => (
              <Text className="mb-1 font-mbold text-2xl">
                Select Delivery Frequency
              </Text>
            )}
            keyExtractor={(item) => item.id}
            renderItem={renderFrequency}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 12,
            }}
          />

          <CustomButton
            title="Continue"
            handlePress={handlePresentSummary}
            containerStyles="mb-2 mt-4 w-full"
            textStyles="text-white"
          />
        </View>
      </CustomButtomSheet>

      <CustomButtomSheet
        ref={summaryModalRef}
        snapPoints={snapPoints}
        enablePenDown={false}
        dynamicSizing={false}
        scrollable
      >
        <View className="h-full">
          <View className="items-start mb-4">
            <Pressable
              onPress={handleCloseSummary}
              className="size-12 items-center justify-center rounded-full bg-green-light"
            >
              <Ionicons name="arrow-back" size={22} color="#218225" />
            </Pressable>
          </View>

          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 12,
            }}
          >
            <Text className="font-mbold text-2xl">Plan Summary</Text>

            <View className="w-full rounded-2xl bg-white p-5">
              <SpaceBetween title="Plan" value={selectedPlan?.name ?? "—"} />
              <SpaceBetween
                title="Weight"
                value={selectedPlan?.weight?.replace(" box", "") ?? "—"}
                containerStyles="mt-2"
              />
              <SpaceBetween
                title="Price"
                value={selectedPlan?.price ?? "—"}
                containerStyles="mt-2"
                valueStyles="font-msbold text-green"
              />
              <SpaceBetween
                title="Frequency"
                value={selectedFrequencyDetails?.title}
                containerStyles="mt-2"
                valueStyles="font-msbold text-green"
              />
            </View>

            {(selectedAttributes?.prefilled_items?.length ?? 0) > 0 && (
              <View className="rounded-2xl bg-white p-5">
                <Text className="font-mbold text-xl">What's included</Text>
                {selectedAttributes?.prefilled_items?.map((item) => (
                    <Text
                      key={item?.product_id}
                      className="mt-2 font-mregular text-base leading-6 text-gray"
                    >
                      {item?.name} - {item?.weight}
                      {item?.weight_unit}
                      {(item?.quantity ?? 0) > 1
                        ? ` X (${item?.quantity})`
                        : ""}
                    </Text>
                  ))}
                {(selectedAttributes?.remaining_weight ?? 0) > 0 && (
                  <Text className="mt-2 font-mregular text-base leading-6 text-green">
                    + Pick the remaining{" "}
                    {selectedAttributes?.remaining_weight}
                    {selectedAttributes?.weight_unit}
                  </Text>
                )}
              </View>
            )}

            {(selectedAttributes?.highlights?.length ?? 0) > 0 && (
              <View className="rounded-2xl bg-white p-5">
                {selectedAttributes?.highlights?.map((benefit, index) => (
                    <View
                      key={`${benefit}-${index}`}
                      className="mb-2 flex-row items-center gap-3 last:mb-0"
                    >
                      <View className="size-5 items-center justify-center rounded-full bg-green-light">
                        <Ionicons
                          name="chevron-forward"
                          size={12}
                          color="#218225"
                        />
                      </View>
                      <Text className="flex-1 font-mregular text-sm leading-5 text-gray">
                        {benefit}
                      </Text>
                    </View>
                  ))}
              </View>
            )}
          </BottomSheetScrollView>

          <CustomButton
            title="Continue"
            handlePress={handleContinueSummary}
            containerStyles="mb-2 mt-4 w-full"
            textStyles="text-white"
          />
        </View>
      </CustomButtomSheet>
    </View>
  );
}

export default function Plans() {
  return <PlansContent variant="onboarding" />;
}
