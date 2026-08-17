import CustomButtomSheet from "@/components/CustomButtomSheet";
import CustomButton from "@/components/CustomButton";
import RetryButton from "@/components/RetryButton";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { axiosClient } from "@/globalApi";
import type {
  GiftBox,
  GiftBoxCardProps,
  GiftBoxListItemProps,
  GiftIncludedCutListItemProps,
  GiftScreenProps,
} from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetFlatList, BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import displayCurrency from "@/utils/displayCurrency";

const giftBoxImage = require("../../../assets/images/onboarding/flexible-box.png");

const mapGiftBox = (item: any): GiftBox => {
  const attributes = item.attributes ?? {};
  return {
    id: String(item.id),
    name: attributes.name ?? "Gift Box",
    description: attributes.description ?? "",
    weight: `${attributes.weight ?? "-"}${attributes.weight_unit ?? ""}`,
    price: displayCurrency(Number(attributes.price ?? 0), "NGN"),
    image: attributes.image ? { uri: attributes.image } : giftBoxImage,
    includedCuts: (attributes.products ?? []).map((line: any, index: number) => {
      const product = line.product_id ?? {};
      const weight =
        line.weight !== undefined
          ? `${line.weight}${line.weight_unit ?? ""}`
          : product.formattedWeight ?? "";
      return {
        id: String(product._id ?? product.id ?? `${item.id}-${index}`),
        name: `${product.name ?? "Item"}${weight ? ` - ${weight}` : ""}`,
        quantity: `${line.quantity ?? 1}x`,
      };
    }),
  };
};

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
  const [giftBoxes, setGiftBoxes] = useState<GiftBox[]>([]);
  const [selectedGift, setSelectedGift] = useState<GiftBox | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGiftBoxes = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setInitialLoading(true);
      setError(null);
      const response = await axiosClient.get("/giftboxes/active");
      setGiftBoxes((response.data?.data ?? []).map(mapGiftBox));
    } catch (requestError: any) {
      setGiftBoxes([]);
      setError(
        requestError.response?.data?.message ??
          "Something went wrong while fetching gift boxes. Please try again.",
      );
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchGiftBoxes();
  }, [fetchGiftBoxes]);

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

      {initialLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#218225" />
          <Text className="mt-2 font-mregular text-xs text-gray">
            Loading gifts...
          </Text>
        </View>
      ) : (
        <FlatList
        data={giftBoxes}
        renderItem={renderGiftBox}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void fetchGiftBoxes(true)}
            colors={["#218225"]}
            tintColor="#218225"
          />
        }
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
        ListEmptyComponent={
          <View className="min-h-96 items-center justify-center px-6">
            <Ionicons
              name={error ? "gift-outline" : "cube-outline"}
              size={34}
              color="#8E8E8E"
            />
            <Text className="mt-4 text-center font-mbold text-lg">
              {error ? "Couldn't load gift boxes" : "No gift boxes found"}
            </Text>
            <Text className="mt-2 text-center font-mregular text-sm leading-6 text-gray">
              {error ??
                "There are no gift boxes available right now. Please check back later."}
            </Text>
            <RetryButton
              onPress={() => void fetchGiftBoxes()}
              containerStyles="mt-5"
            />
          </View>
        }
        />
      )}

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
