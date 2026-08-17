import HomeSkeleton from "@/components/home/HomeSkeleton";
import RetryButton from "@/components/RetryButton";
import { axiosClient } from "@/globalApi";
import { useProfileStore } from "@/store/ProfileStore";
import { useAddonStore } from "@/store/addonStore";
import { useCartStore } from "@/store/cartStore";
import type {
  GreenIconProps,
  HomeStats,
  OverviewCardProps,
  SubscriptionDetailProps,
} from "@/types";
import { formatDate } from "@/utils/DateLabels";
import { getFrequencyWeeksString } from "@/utils/conversion";
import displayCurrency from "@/utils/displayCurrency";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

function GreenIcon({ icon, size = 20 }: GreenIconProps) {
  return (
    <View className="size-10 items-center justify-center rounded-full bg-[#E8F5EC]">
      <MaterialCommunityIcons name={icon} size={size} color="#218225" />
    </View>
  );
}

function OverviewCard({ icon, label, value, onPress }: OverviewCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? `${label}: ${value}` : undefined}
      disabled={!onPress}
      onPress={onPress}
      className="flex-1 rounded-xl bg-white p-4 active:opacity-70"
    >
      <GreenIcon icon={icon} />
      <View className="mt-2">
        <Text className="font-mmedium text-xs text-gray">{label}</Text>
        <Text className="mt-1 font-mbold text-base">{value}</Text>
      </View>
    </Pressable>
  );
}

function SubscriptionDetail({ icon, label, value }: SubscriptionDetailProps) {
  return (
    <View className="flex-row items-center gap-1" style={{ width: "48%" }}>
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
  const toast = useToast();
  const profile = useProfileStore((state) => state.userProfile);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalAddonItems = useAddonStore((state) => state.totalAddonItems);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [renewing, setRenewing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const totalBaseitems = totalItems();
  const totalAddons = totalAddonItems();

  const total = totalBaseitems + totalAddons;

  const firstName = profile.firstName.trim() || "Member";
  const initial = firstName.charAt(0).toUpperCase();
  const statsUnavailable = Boolean(statsError && !stats);
  const canRenew =
    stats?.activePlanStatus === "pending_payment" ||
    stats?.activePlanStatus === "failed";

  const overviewItems: OverviewCardProps[] = [
    {
      icon: "cube",
      label: "Active Plan",
      value: statsUnavailable ? "—" : (stats?.activePlanName ?? "None"),
    },
    {
      icon: "sync-circle",
      label: "Total Orders",
      value: statsUnavailable ? "—" : String(stats?.totalOrders ?? 0),
      onPress: () => router.push("/(protected)/(tabs)/Home/OrderHistory"),
    },
    {
      icon: "truck-fast",
      label: "Next Delivery",
      value: statsUnavailable
        ? "—"
        : formatDate(stats?.nextDeliveryDate ?? null, "MMM dd"),
    },
    {
      icon: "calendar-month",
      label: "Member Since",
      value: statsUnavailable
        ? "—"
        : formatDate(stats?.memberSince ?? null, "MMM yyyy"),
    },
  ];

  const getStats = useCallback(
    async (showSkeleton = true) => {
      try {
        setStatsError(null);
        if (showSkeleton) {
          setInitialLoading(true);
        } else {
          setRefreshing(true);
        }

        const response = await axiosClient.get("/stats/me");
        const summary = response.data?.data?.attributes?.summary;
        const activePlan = summary?.active_plan;
        const membership = summary?.membership;
        const price = Number(activePlan?.price);
        const totalOrders = Number(summary?.total_orders);

        setStats({
          subscriptionId: activePlan?.subscription_id ?? null,
          activePlanName: activePlan?.plan_name ?? null,
          activePlanStatus: activePlan?.status ?? null,
          frequency: activePlan?.frequency ?? null,
          totalOrders: Number.isFinite(totalOrders) ? totalOrders : 0,
          nextDeliveryDate: summary?.next_delivery_date ?? null,
          memberSince: summary?.member_since ?? null,
          price: Number.isFinite(price) ? price : null,
          weight:
            activePlan?.weight === undefined || activePlan?.weight === null
              ? null
              : String(activePlan.weight),
          weightUnit: activePlan?.weight_unit ?? null,
          nextBillingDate: summary?.next_billing_date ?? null,
          nextCutoffAt: summary?.next_cutoff_at ?? null,
          membershipStatus: membership?.status ?? null,
          whatsappCommunityUrl:
            membership?.whatsapp_community_url ?? null,
        });
      } catch (error: any) {
        const message =
          error.response?.data?.message ?? "Unable to load your account.";
        setStatsError(message);
        toast.show(message, { type: "danger" });
      } finally {
        if (showSkeleton) {
          setInitialLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [toast],
  );

  useEffect(() => {
    void getStats();
  }, [getStats]);

  const renewSubscription = async () => {
    if (!stats?.subscriptionId || renewing) {
      if (!stats?.subscriptionId) {
        toast.show("No subscription is available to renew.", {
          type: "danger",
        });
      }
      return;
    }

    try {
      setRenewing(true);
      const response = await axiosClient.post(
        `/subscriptions/${stats.subscriptionId}/pay`,
      );
      const attributes = response.data?.data?.attributes;
      const paymentLink =
        attributes?.authorization_url ??
        attributes?.payment?.authorization_url;

      if (!paymentLink) {
        toast.show("The payment link was not returned. Please try again.", {
          type: "danger",
        });
        return;
      }

      await WebBrowser.openBrowserAsync(paymentLink);
    } catch (error: any) {
      toast.show(
        error.response?.data?.message ?? "Failed to initialize payment.",
        { type: "danger" },
      );
    } finally {
      setRenewing(false);
    }
  };

  const openCommunity = async () => {
    if (!stats?.whatsappCommunityUrl) return;

    try {
      await Linking.openURL(stats.whatsappCommunityUrl);
    } catch {
      toast.show("Unable to open the WhatsApp community.", {
        type: "danger",
      });
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />

      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable
          onPress={() =>
            router.push("/(protected)/(routes)/PersonalInformation")
          }
          className="flex-1 flex-row items-center"
        >
          <View className="size-10 items-center justify-center rounded-full bg-green">
            <Text className="font-mbold text-xl text-white">{initial}</Text>
          </View>
          <View className="ml-2 flex-1">
            <Text numberOfLines={1} className="font-mbold text-lg">
              Hello, {firstName}! 👋
            </Text>
            <Text className="font-mregular text-xs text-gray">
              Here's a snapshot of your account.
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(onboarding)/ReviewCart")}
          className="ml-3 size-10 items-center justify-center rounded-full bg-green-light active:opacity-70"
        >
          <MaterialCommunityIcons name="cart" size={19} color="#218225" />
          {total > 0 && (
            <View className="absolute -right-0.5 -top-1 min-w-4 items-center justify-center rounded-full bg-white px-1 border border-gray-200">
              <Text className="font-mbold text-[10px] text-red-600">
                {total > 99 ? "99+" : total}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void getStats(false)}
            colors={["#218225"]}
            tintColor="#218225"
          />
        }
      >
        {!initialLoading && statsError ? (
          <View className="mt-4 flex-row items-center rounded-xl border border-red-200 bg-red-50 p-3">
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={20}
              color="#B52227"
            />
            <Text className="ml-2 flex-1 font-mregular text-xs text-[#702024]">
              {statsError}
            </Text>
            <RetryButton onPress={() => void getStats()} />
          </View>
        ) : null}

        {initialLoading ? (
          <HomeSkeleton />
        ) : (
          <>
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
          <View className="flex-row items-start justify-between gap-3 bg-green-light px-4 py-6">
            <View className="flex-1">
              {stats?.activePlanStatus === "active" ? (
                <View className="mb-2 self-start rounded-full border border-green bg-green-lighter px-3 py-1">
                  <Text className="font-msbold text-[9px] text-green">
                    Active Subscription
                  </Text>
                </View>
              ) : null}
              <Text className="font-mbold text-lg">
                {statsUnavailable
                  ? "—"
                  : stats?.activePlanName
                  ? `${stats.activePlanName} Plan`
                  : "No Plan"}
              </Text>
              <Text className="mt-1 font-mregular text-xs text-gray">
                {statsUnavailable
                  ? "—"
                  : stats?.activePlanName
                  ? `${stats.weight ?? ""}${stats.weightUnit ?? ""} • ${getFrequencyWeeksString(stats.frequency ?? 0)} delivery`
                  : "No active subscription"}
              </Text>
            </View>

            {statsUnavailable ? (
              <Text className="font-mbold text-lg text-green">—</Text>
            ) : stats?.price !== null && stats?.price !== undefined ? (
              <View className="items-end">
                <Text className="font-mbold text-lg text-green">
                  {displayCurrency(stats.price, "NGN")}
                </Text>
                <Text className="font-mregular text-[9px] text-gray">
                  per cycle
                </Text>
              </View>
            ) : null}
          </View>

          <View className="px-4 py-5">
            <View className="flex-row flex-wrap justify-between gap-y-4">
              <SubscriptionDetail
                icon="calendar-month"
                label="Next Billing"
                value={
                  statsUnavailable
                    ? "—"
                    : formatDate(
                        stats?.nextBillingDate ?? null,
                        "MMM dd, yyyy",
                      )
                }
              />
              <SubscriptionDetail
                icon="truck-fast"
                label="Next Delivery"
                value={
                  statsUnavailable
                    ? "—"
                    : formatDate(
                        stats?.nextDeliveryDate ?? null,
                        "MMM dd, yyyy",
                      )
                }
              />
              <SubscriptionDetail
                icon="pencil-box"
                label="Edit Cutoff"
                value={
                  statsUnavailable
                    ? "—"
                    : formatDate(
                        stats?.nextCutoffAt ?? null,
                        "MMM dd, h:mm a",
                      )
                }
              />
            </View>

            <View className="mt-6 flex-row flex-wrap gap-2">
              {canRenew ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={renewSubscription}
                  disabled={renewing}
                  className={`h-11 items-center justify-center rounded-lg bg-green px-4 active:opacity-80 ${renewing ? "opacity-50" : ""}`}
                >
                  <Text className="font-mbold text-xs text-white">
                    {renewing ? "Processing..." : "Renew Subscription"}
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push("/(protected)/(tabs)/Home/MySubscriptions")
                }
                className="h-11 items-center justify-center rounded-lg bg-green px-6 active:opacity-80"
              >
                <Text className="font-mbold text-xs text-white">
                  Manage Subscription
                </Text>
              </Pressable>

              {stats?.membershipStatus === "active" &&
              stats.whatsappCommunityUrl ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={openCommunity}
                  className="h-11 flex-row items-center justify-center gap-1.5 rounded-lg bg-green px-4 active:opacity-80"
                >
                  <MaterialCommunityIcons
                    name="whatsapp"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text className="font-mbold text-xs text-white">
                    Join Our Community
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push("/(protected)/(tabs)/Home/OrderHistory")
              }
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
          </>
        )}
      </ScrollView>
    </View>
  );
}
