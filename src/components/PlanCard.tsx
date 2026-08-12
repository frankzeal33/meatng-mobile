import CustomButton from "@/components/CustomButton";
import { PlanCardProps } from "@/types/general";
import { Image as ExpoImage } from "expo-image";
import { memo } from "react";
import { Text, View } from "react-native";

const PlanCard = memo(function PlanCard({ plan, onSelect }: PlanCardProps) {
  return (
    <View className="overflow-hidden rounded-2xl bg-white">
      <View className="h-40 overflow-hidden bg-gray-50">
        <ExpoImage
          source={plan?.image}
          contentFit="cover"
          transition={200}
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      <View className="p-4">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="flex-1 font-mbold text-lg">{plan?.name}</Text>
          <Text className="font-msbold text-[11px] text-green">
            {plan?.type}
          </Text>
        </View>

        <Text className="mt-2 font-mregular text-sm leading-5 text-gray">
          {plan?.description}
        </Text>

        <View className="mt-2 flex-row items-baseline">
          <Text className="font-mbold text-xl text-green">{plan?.price}</Text>
          <Text className="ml-1 font-mregular text-xs text-gray">/cycle</Text>
        </View>

        <View className="mt-2 flex-row items-center justify-between gap-2">
          <Text className="font-mbold text-base">{plan?.weight}</Text>
          {plan?.isFeatured && (
            <View className="rounded-full bg-green-light px-2 py-1">
              <Text className="font-msbold text-[10px] text-green">
                Featured
              </Text>
            </View>
          )}
        </View>
        <Text className="mt-1 font-mregular text-sm text-gray">
          {plan?.breakdown}
        </Text>

        <CustomButton
          title="Get Started"
          handlePress={() => onSelect(plan)}
          containerStyles="w-full mt-4 bg-white border border-green"
          textStyles="text-green"
        />
      </View>
    </View>
  );
});

export default PlanCard;
