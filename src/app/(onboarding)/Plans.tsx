import CustomButtomSheet from "@/components/CustomButtomSheet";
import CustomButton from "@/components/CustomButton";
import PlanCard from "@/components/PlanCard";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import type { PlanType } from "@/types/general";
import type {
  DeliveryFrequency,
  DeliveryFrequencyListItemProps,
  PlanListItemProps,
  PlansScreenProps,
} from "@/types/onboarding";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const chefCuts = require("../../../assets/images/onboarding/chef-cuts.png");
const flexibleBox = require("../../../assets/images/onboarding/flexible-box.png");
const meatLovers = require("../../../assets/images/onboarding/meat-lovers.png");

const plans: PlanType[] = [
  {
    id: "value",
    name: "Value Plan",
    type: "Custom",
    description:
      "3kg mixed cuts of beef and offal. Choose 500g of offal to complete your box.",
    price: "₦20,000.00",
    weight: "3kg box",
    breakdown: "2.5kg fixed + build 0.5kg",
    image: chefCuts,
  },
  {
    id: "chicken-crate",
    name: "Chicken Crate",
    type: "Standard",
    description:
      "The Chicken Crate is built for the real chicken lovers, packed with 5kg of Chicken cut and from to add your favorite cuts. Healthy, fresh, and delivered straight to your door.",
    price: "₦24,000.00",
    weight: "5kg box",
    breakdown: "5kg fixed",
    image: flexibleBox,
  },
  {
    id: "beef",
    name: "Beef Box",
    type: "Standard",
    description:
      "The Beef Box is built for those who know good beef, stacked with quality cuts and room to add your favorites. Fresh, healthy, and delivered straight to your door.",
    price: "₦30,000.00",
    weight: "4kg box",
    breakdown: "4kg fixed",
    image: chefCuts,
  },
  {
    id: "essential",
    name: "Essential Box",
    type: "Custom",
    description:
      "5kg mixed cuts of beef, chicken & offal. Choose 500g of offal to personalize.",
    price: "₦35,000.00",
    weight: "5kg box",
    breakdown: "4.5kg fixed + build 0.5kg",
    image: flexibleBox,
  },
  {
    id: "signature",
    name: "Signature Box",
    type: "Standard",
    description:
      "10kg premium cuts - 5kg mandatory cuts, then build the rest your own way.",
    price: "₦70,000.00",
    weight: "10kg box",
    breakdown: "5kg fixed + build 5kg",
    image: meatLovers,
  },
  {
    id: "premium",
    name: "Premium Box",
    type: "Standard",
    description:
      "15kg premium cuts, 5kg Mandatory, then choose and build 10kg however you like it.",
    price: "₦110,000.00",
    weight: "15kg box",
    breakdown: "5kg fixed + build 10kg",
    image: chefCuts,
  },
];

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
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [selectedFrequency, setSelectedFrequency] =
    useState<DeliveryFrequency["id"]>("weekly");
  const selectedFrequencyDetails =
    deliveryFrequencies.find(
      (frequency) => frequency.id === selectedFrequency,
    ) ?? deliveryFrequencies[0];

  const handlePresentModalPress = useCallback(() => {
    frequencyModalRef.current?.present();
  }, []);

  const handleSelectPlan = useCallback(
    (plan: PlanType) => {
      setSelectedPlan(plan);
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

  const handleCloseModalPress = useCallback(() => {
    frequencyModalRef.current?.dismiss();
  }, []);

  const handlePresentSummary = useCallback(() => {
    summaryModalRef.current?.present();
  }, []);

  const handleCloseSummary = useCallback(() => {
    summaryModalRef.current?.dismiss();
  }, []);

  const handleContinueSummary = useCallback(() => {
    summaryModalRef.current?.dismiss();
    frequencyModalRef.current?.dismiss();

    if (!selectedPlan) {
      return;
    }

    router.push({
      pathname: "/(onboarding)/PrebuiltBox",
      params: {
        planName: selectedPlan.name,
        weight: selectedPlan.weight.replace(" box", ""),
        frequency: selectedFrequencyDetails.title,
        price: selectedPlan.price,
      },
    });
  }, [selectedFrequencyDetails.title, selectedPlan]);

  const renderFrequency = useCallback(
    ({ item }: DeliveryFrequencyListItemProps) => {
      const isSelected = selectedFrequency === item.id;

      return (
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={`${item.title}: ${item.billing}`}
          onPress={() => setSelectedFrequency(item.id)}
          className={`rounded-2xl border p-5 ${
            isSelected
              ? "border-green bg-green-lighter"
              : "border-transparent bg-white"
          }`}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={18} color="#218225" />
            <Text className="font-mbold text-xl text-[#292929]">
              {item.title}
            </Text>
          </View>

          <Text className="mt-2 font-mregular text-lg text-gray">
            {item.description}
          </Text>
          <Text className="mt-2 font-mregular text-lg text-green">
            {item.billing}
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

      <FlatList
        data={plans}
        renderItem={renderPlan}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: isTab ? 16 : 12,
          paddingBottom: isTab ? 16 : insets.bottom + 12,
          gap: 16,
        }}
        ListHeaderComponent={
          <View className="pb-2">
            <Text className={`font-mbold ${isTab ? "text-xl" : "text-2xl"}`}>
              {isTab ? "Plans" : "Pick a plan, build your box."}
            </Text>
            <Text className="font-mregular text-sm leading-5 text-gray">
              {isTab
                ? "Each plan comes pre-packed with quality cuts."
                : "Each plan comes pre-packed with quality cuts. Choose your delivery frequency, then add optional extras on the next step."}
            </Text>
          </View>
        }
      />

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
                value={selectedPlan?.weight.replace(" box", "") ?? "—"}
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
                value={selectedFrequencyDetails.title}
                containerStyles="mt-2"
                valueStyles="font-msbold text-green"
              />
            </View>

            <View className="rounded-2xl bg-white p-5">
              <Text className="font-mbold text-xl">What's included</Text>
              <Text className="mt-2 font-mregular text-base leading-6 text-gray">
                {selectedPlan?.breakdown ?? "Plan contents"}
              </Text>
              <Text className="mt-2 font-mregular text-base leading-6 text-gray">
                Premium cuts selected for your {selectedPlan?.weight ?? "box"}
              </Text>
              {selectedPlan?.type === "Custom" && (
                <Text className="mt-2 font-mregular text-base leading-6 text-green">
                  + Pick the remaining custom portion
                </Text>
              )}
            </View>

            <View className="rounded-2xl bg-white p-5">
              {[
                `${selectedPlan?.breakdown ?? "Quality cuts included"}`,
                `Delivered ${selectedFrequencyDetails.title.toLowerCase()}`,
                "Dashboard control (edit/skip/pause)",
                "Flexible delivery scheduling",
              ].map((benefit) => (
                <View
                  key={benefit}
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
