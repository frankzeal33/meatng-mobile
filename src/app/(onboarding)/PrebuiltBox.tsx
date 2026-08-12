import CustomButton from "@/components/CustomButton";
import CartHeaderButton from "@/components/CartHeaderButton";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import type { PreBuiltItemType } from "@/types/general";
import type { PreBuiltCardProps } from "@/types/onboarding";
import { formatEnums } from "@/utils/formatEnums";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { memo } from "react";
import { FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PreBuiltCard = memo(function PreBuiltCard({ item }: PreBuiltCardProps) {
  return (
    <View className="overflow-hidden rounded-2xl bg-white">
      <View className="h-40 overflow-hidden bg-gray-50">
        <ExpoImage
          source={item?.image}
          contentFit="cover"
          transition={200}
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      <View className="p-4">
        <Text className="font-mbold text-lg">{item.name}</Text>
        <Text className="mt-1 font-mmedium text-base text-gray">
          {item.weight}
        </Text>

        <View className="mt-3 h-12 flex-row items-center justify-center gap-2 rounded-lg bg-red-500/50">
          <Feather name="lock" size={16} color="#FFF" />
          <Text className="font-msbold text-lg text-white">
            {item.quantity} Included
          </Text>
        </View>
      </View>
    </View>
  );
});

function renderPreBuiltItem({ item }: PreBuiltCardProps) {
  return <PreBuiltCard item={item} />;
}

export default function PrebuiltBox() {
  const insets = useSafeAreaInsets();
  const subInfo = useSubscriptionStore((state) => state.subInfo);
  const attributes = subInfo?.subscription?.attributes;
  const planName = attributes?.name ?? "Subscription Plan";
  const weight = `${attributes?.weight ?? 0}${attributes?.weight_unit ?? "kg"}`;
  const frequency = formatEnums(subInfo?.selectedFrequency ?? "weekly");
  const preBuiltItems: PreBuiltItemType[] =
    attributes?.prefilled_items?.map((item) => ({
      id: item?.product_id,
      name: item?.name,
      weight: `${item?.weight}${item?.weight_unit}`,
      quantity: item?.quantity,
      image: item?.image_url,
    })) ?? [];

  return (
    <View
      className="flex-1 bg-background px-4"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StatusBar style="dark" />

      <SpaceBetweenHeader
        onBackPress={() => router.back()}
        rightContent={<CartHeaderButton />}
      />

      <FlatList
        data={preBuiltItems}
        renderItem={renderPreBuiltItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 16,
          paddingTop: 12,
          paddingBottom: 20,
        }}
        ListHeaderComponent={
          <View className="pb-2">
            <Text className="font-mbold text-3xl">Build Your Box</Text>
            <Text className="mt-1 font-mregular text-base text-gray">
              {planName} - {weight} - {frequency}
            </Text>

            <View className="mt-6 flex-row items-center justify-between gap-3">
              <View className="flex-1 flex-row items-center gap-2">
                <View className="size-8 items-center justify-center rounded-full bg-green-light">
                  <Ionicons
                    name="lock-closed-outline"
                    size={16}
                    color="#218225"
                  />
                </View>
                <Text className="flex-1 font-mbold text-xl">
                  Pre-built in Your Box
                </Text>
              </View>

              <View className="rounded-full bg-green-light px-3 py-2">
                <Text className="font-msbold text-xs text-green">
                  {preBuiltItems.length} items
                </Text>
              </View>
            </View>

            <Text className="mt-2 font-mregular text-base leading-6 text-gray">
              These cuts come included with your {planName}. They can't be
              removed.
            </Text>
          </View>
        }
      />

      <CustomButton
        title="Continue"
        handlePress={() => router.push("/(onboarding)/BuildYourBox")}
        containerStyles="mb-2 mt-4 w-full"
        textStyles="text-white"
      />
    </View>
  );
}
