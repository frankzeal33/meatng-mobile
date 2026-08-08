import type {
  GreenIconProps,
  OverviewCardProps,
  SubscriptionDetailProps,
} from "@/types/general";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const overviewItems: OverviewCardProps[] = [
  { icon: "cube", label: "Active Plan", value: "None" },
  { icon: "sync-circle", label: "Total Orders", value: "0" },
  { icon: "truck-fast", label: "Next Delivery", value: "None" },
  { icon: "calendar-month", label: "Member Since", value: "None" },
];

function GreenIcon({ icon, size = 20 }: GreenIconProps) {
  return (
    <View className="size-10 items-center justify-center rounded-full bg-[#E8F5EC]">
      <MaterialCommunityIcons name={icon} size={size} color="#218225" />
    </View>
  );
}

function OverviewCard({ icon, label, value }: OverviewCardProps) {
  return (
    <View className="min-h-34 flex-1 justify-between rounded-xl bg-white p-4">
      <GreenIcon icon={icon} />
      <View className="mt-4">
        <Text className="font-mmedium text-xs text-gray">{label}</Text>
        <Text className="mt-1 font-mbold text-base">{value}</Text>
      </View>
    </View>
  );
}

function SubscriptionDetail({ icon, label, value }: SubscriptionDetailProps) {
  return (
    <View className="flex-1 flex-row items-center gap-1">
      <View className="size-6 items-center justify-center rounded-full bg-green-light">
        <MaterialCommunityIcons name={icon} size={13} color="#218225" />
      </View>
      <View className="flex-1">
        <Text className="font-mregular text-[9px] text-gray">{label}</Text>
        <Text className="font-mbold text-[11px]">{value}</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-1 flex-row items-center">
          <View className="size-10 items-center justify-center rounded-full bg-green">
            <Text className="font-mbold text-xl text-white">M</Text>
          </View>
          <View className="ml-2 flex-1">
            <Text numberOfLines={1} className="font-mbold text-lg">
              Hello, Franklin! 👋
            </Text>
            <Text className="font-mregular text-xs text-gray">
              Here's a snapshot of your account.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open cart, 4 items"
          className="ml-3 size-10 items-center justify-center rounded-full bg-green-light active:opacity-70"
        >
          <MaterialCommunityIcons name="cart" size={19} color="#218225" />
          <View className="absolute -right-0.5 -top-1 min-w-4 items-center justify-center rounded-full bg-white px-1 border border-gray-200">
            <Text className="font-mbold text-[10px] text-red-600">4</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-4"
      >
        <View className="mt-4 gap-3">
          <View className="flex-row gap-3">
            <OverviewCard {...overviewItems[0]} />
            <OverviewCard {...overviewItems[1]} />
          </View>
          <View className="flex-row gap-3">
            <OverviewCard {...overviewItems[2]} />
            <OverviewCard {...overviewItems[3]} />
          </View>
        </View>

        <View className="mt-4 overflow-hidden rounded-xl bg-white">
          <View className="bg-green-light px-4 py-6">
            <Text className="font-mbold text-2xl">No Plan</Text>
            <Text className="mt-1 font-mregular text-xs text-gray">
              Unknown delivery
            </Text>
          </View>

          <View className="px-4 py-7">
            <View className="flex-row gap-3">
              <SubscriptionDetail
                icon="calendar-month"
                label="Next Billing"
                value="None"
              />
              <SubscriptionDetail
                icon="truck-fast"
                label="Next Delivery"
                value="None"
              />
              <SubscriptionDetail
                icon="pencil-box"
                label="Edit Cutoff"
                value="None"
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push("/(protected)/(tabs)/Home/MySubscriptions")
              }
              className="mt-8 h-11 self-start items-center justify-center rounded-lg bg-green px-6 active:opacity-80"
            >
              <Text className="font-mbold text-xs text-white">
                Manage Subscription
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/(protected)/(tabs)/Home/OrderHistory")}
          className="mt-4 flex-row items-center rounded-xl bg-white p-4 active:opacity-70"
        >
          <GreenIcon icon="history" />
          <View className="ml-3 flex-1">
            <Text className="font-mbold text-base text-[#2D2D2D]">
              View Orders
            </Text>
            <Text className="mt-1 font-mregular text-xs text-[#999999]">
              Track past and upcoming orders
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={26}
            color="#3E3E3E"
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}
