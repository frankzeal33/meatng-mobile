import HomeListHeader from "@/components/home/HomeListHeader";
import type { HomeFilterItem } from "@/types/home";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const subscriptionFilters: HomeFilterItem[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "cancelled", label: "Cancelled" },
  { id: "expired", label: "Expired" },
  { id: "due", label: "Due" },
];

export default function MySubscriptionsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <HomeListHeader title="My Subscriptions" subtitle="Manage your plan, size, and delivery preferences." filters={subscriptionFilters} selectedFilter={selectedFilter} searchValue={searchValue} onFilterChange={setSelectedFilter} onSearchChange={setSearchValue} />
      <FlatList
        data={[]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}
        renderItem={() => null}
        ListEmptyComponent={
          <View className="min-h-64 items-center justify-center rounded-xl bg-white px-6">
            <View className="size-15 items-center justify-center rounded-full bg-green-light">
              <MaterialCommunityIcons name="cube" size={29} color="#218225" />
            </View>
            <Text className="mt-4 font-mbold text-base">No Active Subscription</Text>
            <Text className="mt-1 text-center font-mregular text-xs leading-5 text-gray">Start your first subscription to get{"\n"}premium meat delivered.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(protected)/(tabs)/Plans")}
              className="mt-6 h-11 items-center justify-center rounded-lg bg-green px-6 active:opacity-80"
            >
              <Text className="font-mbold text-xs text-white">
                Purchase Subscription
              </Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}
