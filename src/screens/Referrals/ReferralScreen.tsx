import { axiosClient } from "@/globalApi";
import RetryButton from "@/components/RetryButton";
import type {
  ReferralActionButtonProps,
  ReferralCode,
  ReferralHistoryItem,
  ReferralHistoryListItemProps,
  ReferralMeta,
  ReferralStat,
  ReferralStatCardProps,
} from "@/types";
import { formatDate } from "@/utils/DateLabels";
import displayCurrency from "@/utils/displayCurrency";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

const PAGE_SIZE = 20;

const emptyMeta: ReferralMeta = {
  total: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: PAGE_SIZE,
};

const emptyStats = {
  totalReferrals: 0,
  pendingReferrals: 0,
  completedReferrals: 0,
  rewardedReferrals: 0,
  totalReferrerReward: 0,
  totalReferredReward: 0,
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? fallback;

const ReferralActionButton = ({
  icon,
  label,
  onPress,
  disabled,
}: ReferralActionButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    className={`h-11 flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-white active:opacity-75 ${disabled ? "opacity-50" : ""}`}
  >
    <MaterialCommunityIcons name={icon} size={12} color="#218225" />
    <Text className="font-msbold text-xs text-green">{label}</Text>
  </Pressable>
);

const ReferralStatCard = ({ item }: ReferralStatCardProps) => (
  <View className="min-h-28 flex-1 rounded-xl bg-white p-3">
    <View className="size-9 items-center justify-center rounded-full bg-green-light">
      <MaterialCommunityIcons name={item.icon} size={18} color="#218225" />
    </View>
    <Text className="mt-3 font-mregular text-[10px] text-gray">
      {item.label}
    </Text>
    <Text className="mt-1 font-mbold text-sm">{item.value}</Text>
  </View>
);

const ReferralHistoryListItem = ({ item }: ReferralHistoryListItemProps) => (
  <View className="bg-white px-4">
    <View className="flex-row items-center border-t border-gray-100 py-4">
      <View className="size-10 items-center justify-center rounded-full bg-green-light">
        <Text className="font-mbold text-sm text-green">{item.initials}</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-msbold text-sm">{item.name}</Text>
        <Text className="mt-1 font-mregular text-[10px] text-gray">
          {item.date}
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-msbold text-xs text-green">{item.reward}</Text>
        <Text
          className={`mt-1 font-mregular text-[10px] capitalize ${item.status.toLowerCase() === "pending" ? "text-[#C58920]" : "text-gray"}`}
        >
          {item.status}
        </Text>
      </View>
    </View>
  </View>
);

const ReferralScreen = () => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<ReferralHistoryItem[]>([]);
  const [meta, setMeta] = useState<ReferralMeta>(emptyMeta);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referralLink = referralCode?.referralCode
    ? `${process.env.EXPO_PUBLIC_FRONTEND_URL}/auth/signup?ref=${referralCode.referralCode}`
    : null;

  const getReferralCode = useCallback(async () => {
    const response = await axiosClient.get("/referrals/my-code");
    const attributes = response.data?.data?.attributes;

    if (attributes) {
      setReferralCode({
        referralCode: attributes.referralCode ?? "",
        stats: { ...emptyStats, ...attributes.stats },
      });
    }
  }, []);

  const getReferrals = useCallback(
    async (pageToFetch: number, append = false) => {
      const response = await axiosClient.get("/referrals/my-referrals", {
        params: { page: pageToFetch, limit: PAGE_SIZE },
      });

      const items: ReferralHistoryItem[] = (response.data?.data ?? []).map(
        (referral: any) => {
          const referredUser =
            referral.relationships?.referredUser?.data?.attributes;
          const name = referredUser?.name || "Unknown";
          const initials = name
            .split(" ")
            .filter(Boolean)
            .map((part: string) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return {
            id: String(referral.id),
            name,
            initials: initials || "?",
            date: referral.attributes?.createdAt
              ? formatDate(referral.attributes.createdAt, "dd MMM yyyy")
              : "N/A",
            status: referral.attributes?.status || "Unknown",
            reward: displayCurrency(
              Number(referral.attributes?.referrerReward) || 0,
              "NGN",
            ),
          };
        },
      );

      setReferrals((current) => (append ? [...current, ...items] : items));

      const responseMeta = response.data?.meta;
      setMeta({
        total: Number(responseMeta?.total) || 0,
        totalPages: Number(responseMeta?.totalPages) || 0,
        currentPage: Number(responseMeta?.currentPage) || pageToFetch,
        pageSize: Number(responseMeta?.pageSize) || PAGE_SIZE,
      });
    },
    [],
  );

  const loadInitialData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);
      await Promise.all([getReferralCode(), getReferrals(1)]);
    } catch (requestError: any) {
      const message = getErrorMessage(
        requestError,
        "Failed to load referrals.",
      );
      setError(message);
      toast.show(message, { type: "danger" });
    } finally {
      setInitialLoading(false);
    }
  }, [getReferralCode, getReferrals, toast]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const refreshReferrals = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await Promise.all([getReferralCode(), getReferrals(1)]);
    } catch (requestError: any) {
      const message = getErrorMessage(
        requestError,
        "Failed to refresh referrals.",
      );
      setError(message);
      toast.show(message, { type: "danger" });
    } finally {
      setRefreshing(false);
    }
  };

  const loadMoreReferrals = async () => {
    if (
      initialLoading ||
      refreshing ||
      loadingMore ||
      meta.currentPage >= meta.totalPages
    ) {
      return;
    }

    try {
      setLoadingMore(true);
      await getReferrals(meta.currentPage + 1, true);
    } catch (requestError: any) {
      toast.show(
        getErrorMessage(requestError, "Failed to load more referrals."),
        { type: "danger" },
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const copyText = async (value: string | null, successMessage: string) => {
    if (!referralCode?.referralCode || !value) {
      toast.show("Referral code is not available.", { type: "warning" });
      return;
    }

    await Clipboard.setStringAsync(value);
    toast.show(successMessage, { type: "success" });
  };

  const shareReferral = async () => {
    if (!referralCode?.referralCode || !referralLink) {
      toast.show("Referral code is not available.", { type: "warning" });
      return;
    }

    await Share.share({
      title: "Join MeatNG",
      message: `Use my referral code ${referralCode.referralCode} to sign up on MeatNG and we both get ₦500 credit! ${referralLink}`,
      url: referralLink,
    });

  };

  const stats = referralCode?.stats ?? emptyStats;
  const statValue = (value: string) =>
    initialLoading || !referralCode ? "—" : value;
  const referralStats: ReferralStat[] = useMemo(
    () => [
      {
        id: "total",
        icon: "account-multiple",
        label: "Total Referrals",
        value: statValue(String(stats.totalReferrals)),
      },
      {
        id: "pending",
        icon: "history",
        label: "Pending",
        value: statValue(String(stats.pendingReferrals)),
      },
      {
        id: "completed",
        icon: "check-circle",
        label: "Completed",
        value: statValue(String(stats.completedReferrals)),
      },
      {
        id: "rewarded",
        icon: "medal",
        label: "Rewarded",
        value: statValue(String(stats.rewardedReferrals)),
      },
      {
        id: "earnings",
        icon: "cash",
        label: "Your Earnings",
        value: statValue(displayCurrency(stats.totalReferrerReward, "NGN")),
      },
      {
        id: "friends",
        icon: "gift",
        label: "Friends Earned",
        value: statValue(displayCurrency(stats.totalReferredReward, "NGN")),
      },
    ],
    [initialLoading, stats],
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <FlatList
        data={referrals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReferralHistoryListItem item={item} />}
        showsVerticalScrollIndicator={false}
        onEndReached={() => void loadMoreReferrals()}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refreshReferrals()}
            colors={["#218225"]}
            tintColor="#218225"
          />
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 20,
        }}
        ListHeaderComponent={
          <View>
            <Text className="font-mbold text-xl">Referral Program</Text>
            <Text className="mt-1 font-mregular text-xs text-gray">
              Invite friends and earn ₦500 credit for every signup.
            </Text>

            <View className="mt-6 rounded-xl bg-green p-4">
              <Text className="font-mbold text-lg text-white">
                Share your code, earn rewards
              </Text>
              <Text className="mt-1 font-mregular text-xs text-white">
                When a friend signs up with your code, you both get ₦500 credit.
              </Text>
              <View className="mt-4 h-11 items-center justify-center rounded-lg bg-green-mildLight">
                {initialLoading ? (
                  <ActivityIndicator size="small" color="#218225" />
                ) : (
                  <Text selectable className="font-mbold text-base text-green">
                    {referralCode?.referralCode || "—"}
                  </Text>
                )}
              </View>
              <View className="mt-4 flex-row gap-2">
                <ReferralActionButton
                  icon="content-copy"
                  label="Copy Code"
                  disabled={!referralCode?.referralCode}
                  onPress={() =>
                    void copyText(
                      referralCode?.referralCode ?? null,
                      "Referral code copied!",
                    )
                  }
                />
                <ReferralActionButton
                  icon="link-variant"
                  label="Copy Link"
                  disabled={!referralLink}
                  onPress={() =>
                    void copyText(referralLink, "Referral link copied!")
                  }
                />
                <ReferralActionButton
                  icon="share-variant"
                  label="Share"
                  disabled={!referralLink}
                  onPress={() => void shareReferral()}
                />
              </View>
            </View>

            <View className="mt-4 gap-3">
              <View className="flex-row gap-3">
                {referralStats.slice(0, 3).map((item) => (
                  <ReferralStatCard key={item.id} item={item} />
                ))}
              </View>
              <View className="flex-row gap-3">
                {referralStats.slice(3).map((item) => (
                  <ReferralStatCard key={item.id} item={item} />
                ))}
              </View>
            </View>

            <View className="mt-4 rounded-t-2xl bg-white px-4 pb-3 pt-4">
              <Text className="font-mbold text-base">Referral History</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="min-h-40 items-center justify-center bg-white px-6">
            {initialLoading ? (
              <>
                <ActivityIndicator size="small" color="#218225" />
                <Text className="mt-2 font-mregular text-xs text-gray">
                  Loading referrals...
                </Text>
              </>
            ) : error ? (
              <>
                <MaterialCommunityIcons
                  name="wifi-alert"
                  size={26}
                  color="#999999"
                />
                <Text className="mt-2 text-center font-mregular text-xs text-gray">
                  {error}
                </Text>
                <RetryButton
                  onPress={() => void loadInitialData()}
                  containerStyles="mt-4"
                />
              </>
            ) : (
              <Text className="text-center font-mregular text-xs text-gray">
                No referrals yet. Share your code to get started!
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          <View className="min-h-4 items-center justify-center rounded-b-2xl bg-white py-2">
            {loadingMore ? (
              <ActivityIndicator size="small" color="#218225" />
            ) : null}
          </View>
        }
      />
    </View>
  );
};

export default ReferralScreen;
