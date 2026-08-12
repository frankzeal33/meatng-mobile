import CustomButtomSheet from "@/components/CustomButtomSheet";
import CustomButton from "@/components/CustomButton";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import type {
  GiftBox,
  GiftBoxCardProps,
  GiftBoxListItemProps,
  GiftIncludedCutListItemProps,
  GiftScreenProps,
} from "@/types/gift";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const giftBoxImage = require("../../../assets/images/onboarding/flexible-box.png");

const giftBoxes: GiftBox[] = [
  {
    id: "classic",
    name: "The Classic Box",
    description:
      "A mix of fresh beef, chicken, and assorted cuts delivered to your door, everything someone needs to cook a proper Nigerian meal, all in one box.",
    weight: "3kg box",
    price: "₦15,000.00",
    image: giftBoxImage,
    includedCuts: [
      { id: "classic-boneless", name: "Boneless Beef - 1kg", quantity: "1x" },
      { id: "classic-bone-in", name: "Bone in Beef - 1kg", quantity: "1x" },
      {
        id: "classic-laps",
        name: "Chicken Laps (500g) - 500g",
        quantity: "1x",
      },
      {
        id: "classic-wings",
        name: "Chicken Wings (500g) - 500g",
        quantity: "1x",
      },
    ],
  },
  {
    id: "celebration",
    name: "Celebration Box",
    description:
      "More meat, more variety, a generous mix of premium beef and chicken cuts made for celebrations and sharing.",
    weight: "4kg box",
    price: "₦25,000.00",
    image: giftBoxImage,
    includedCuts: [
      {
        id: "celebration-boneless",
        name: "Boneless Beef - 1kg",
        quantity: "1x",
      },
      { id: "celebration-bone-in", name: "Bone in Beef - 1kg", quantity: "1x" },
      {
        id: "celebration-laps",
        name: "Chicken Laps (500g) - 500g",
        quantity: "1x",
      },
      {
        id: "celebration-wings",
        name: "Chicken Wings (500g) - 500g",
        quantity: "1x",
      },
      { id: "celebration-liver", name: "Liver - 100g", quantity: "2x" },
      { id: "celebration-shaki", name: "Shaki (Tripe) - 100g", quantity: "2x" },
      { id: "celebration-gizzards", name: "Gizzards - 100g", quantity: "2x" },
      { id: "celebration-ponmo", name: "Ponmo (White) - 200g", quantity: "2x" },
    ],
  },
  {
    id: "family",
    name: "Family Feast Box",
    description:
      "A hearty selection of fresh cuts for family meals, weekend cooking, and memorable moments together.",
    weight: "10kg box",
    price: "₦50,000.00",
    image: giftBoxImage,
    includedCuts: [
      { id: "family-boneless", name: "Boneless Beef - 1kg", quantity: "2x" },
      { id: "family-bone-in", name: "Bone in Beef - 1kg", quantity: "2x" },
      { id: "family-chicken", name: "Whole Chicken - 1.5kg", quantity: "2x" },
      { id: "family-laps", name: "Chicken Laps - 1kg", quantity: "2x" },
      { id: "family-offal", name: "Assorted Offal - 1kg", quantity: "1x" },
    ],
  },
];

const GiftBoxCard = memo(function GiftBoxCard({
  item,
  onSelect,
}: GiftBoxCardProps) {
  return (
    <View className="overflow-hidden rounded-2xl bg-white">
      <View className="h-40 items-center justify-center bg-white px-4 pt-3">
        <ExpoImage
          source={item.image}
          contentFit="contain"
          transition={200}
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      <View className="px-4 pb-6 pt-4">
        <Text className="font-mbold text-lg">{item.name}</Text>
        <Text className="mt-2 font-mregular text-base text-gray">
          {item.description}
        </Text>
        <Text className="mt-2 font-mbold text-base">{item.weight}</Text>
        <Text className="mt-2 font-mbold text-xl text-green">{item.price}</Text>

        <CustomButton
          title="Get Started"
          handlePress={() => onSelect(item)}
          containerStyles="mt-3 w-full border border-green bg-white"
          textStyles="text-green"
        />
      </View>
    </View>
  );
});

export default function GiftScreen({ variant = "tab" }: GiftScreenProps) {
  const insets = useSafeAreaInsets();
  const isTab = variant === "tab";
  const previewModalRef = useRef<BottomSheetModal>(null);
  const pendingRecipientGiftRef = useRef<GiftBox | null>(null);
  const previewSnapPoints = useMemo(() => ["90%"], []);
  const [selectedGift, setSelectedGift] = useState<GiftBox | null>(null);

  const handleSelectGift = useCallback((giftBox: GiftBox) => {
    setSelectedGift(giftBox);
    previewModalRef.current?.present();
  }, []);

  const handleClosePreview = () => {
    previewModalRef.current?.dismiss();
  };

  const handleContinuePreview = () => {
    if (!selectedGift) {
      return;
    }

    pendingRecipientGiftRef.current = selectedGift;
    previewModalRef.current?.dismiss();
  };

  const handlePreviewDismiss = () => {
    const giftBox = pendingRecipientGiftRef.current;

    if (!giftBox) {
      return;
    }

    pendingRecipientGiftRef.current = null;
    router.push({
      pathname: "/(onboarding)/RecipientInformation",
      params: {
        giftId: giftBox.id,
        giftName: giftBox.name,
        weight: giftBox.weight,
        price: giftBox.price,
        includedCuts: JSON.stringify(giftBox.includedCuts),
      },
    });
  };

  const renderGiftBox = useCallback(
    ({ item }: GiftBoxListItemProps) => (
      <GiftBoxCard item={item} onSelect={handleSelectGift} />
    ),
    [handleSelectGift],
  );

  const renderIncludedCut = useCallback(
    ({ item }: GiftIncludedCutListItemProps) => (
      <View className="bg-white px-4">
        <SpaceBetween
          title={item.name}
          value={item.quantity}
          containerStyles="mb-2"
          titleStyles="text-gray"
        />
      </View>
    ),
    [],
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
          showRight={false}
        />
      )}

      <FlatList
        data={giftBoxes}
        renderItem={renderGiftBox}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 20,
          paddingTop: isTab ? 16 : 12,
          paddingBottom: isTab ? 16 : insets.bottom + 12,
        }}
        ListHeaderComponent={
          <View className="pb-2">
            <Text className="font-mbold text-2xl">Gift</Text>
            <Text className="font-mregular text-sm text-gray">
              Choose a gift box, add a message card, and send it to cart or
              straight to checkout.
            </Text>
          </View>
        }
      />

      <CustomButtomSheet
        ref={previewModalRef}
        snapPoints={previewSnapPoints}
        onDismiss={handlePreviewDismiss}
        enablePenDown={false}
        dynamicSizing={false}
        scrollable
      >
        <View className="h-full">
          <View className="items-start mb-4">
            <Pressable
              onPress={handleClosePreview}
              className="size-12 items-center justify-center rounded-full bg-green-light"
            >
              <Ionicons name="arrow-back" size={22} color="#218225" />
            </Pressable>
          </View>

          <BottomSheetFlatList
            style={{ flex: 1 }}
            data={selectedGift?.includedCuts ?? []}
            renderItem={renderIncludedCut}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12 }}
            ListHeaderComponent={
              <View>
                <Text className="mb-4 font-mbold text-2xl">
                  Gift order preview
                </Text>
                <View className="mb-3 rounded-2xl bg-white p-4">
                  <SpaceBetween
                    title="Gift Plan"
                    value={selectedGift?.name ?? "—"}
                  />
                  <SpaceBetween
                    title="Weight"
                    value={selectedGift?.weight.replace(" box", "") ?? "—"}
                    containerStyles="mt-2"
                  />
                  <SpaceBetween
                    title="Price"
                    value={selectedGift?.price ?? "—"}
                    containerStyles="mt-2"
                    valueStyles="font-msbold text-green"
                  />
                </View>
                <View className="rounded-t-2xl bg-white p-4">
                  <Text className="font-mbold text-xl">Included cuts</Text>
                </View>
              </View>
            }
            ListFooterComponent={
              <View className="h-3 rounded-b-2xl bg-white" />
            }
          />

          <CustomButton
            title="Continue"
            handlePress={handleContinuePreview}
            containerStyles="mb-2 mt-4 w-full"
            textStyles="text-white"
          />
        </View>
      </CustomButtomSheet>
    </View>
  );
}
