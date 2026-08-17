import HomeListHeader from "@/components/home/HomeListHeader";
import RetryButton from "@/components/RetryButton";
import { axiosClient } from "@/globalApi";
import type {
  CustomerSubscription,
  HomeFilterItem,
  OrderMeta,
} from "@/types";
import { formatDate } from "@/utils/DateLabels";
import { getFrequencyWeeksString } from "@/utils/conversion";
import displayCurrency from "@/utils/displayCurrency";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

const PAGE_SIZE = 20;

const subscriptionFilters: HomeFilterItem[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "cancelled", label: "Cancelled" },
  { id: "expired", label: "Expired" },
  { id: "past_due", label: "Past Due" },
];

const emptyMeta: OrderMeta = {
  total: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: PAGE_SIZE,
};

const formatEnum = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return { background: "bg-green-light", text: "text-green" };
    case "paused":
    case "pending_payment":
    case "past_due":
      return { background: "bg-amber-50", text: "text-amber-700" };
    case "cancelled":
    case "expired":
    case "failed":
      return { background: "bg-red-50", text: "text-red-700" };
    default:
      return { background: "bg-gray-100", text: "text-gray" };
  }
};

const SubscriptionValue = ({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) => (
  <View
    className="mb-3 rounded-xl bg-green-lighter p-3"
    style={{ width: "48%" }}
  >
    <Text className="font-mregular text-[10px] uppercase tracking-wide text-gray">
      {label}
    </Text>
    <Text className="mt-1 font-mbold text-base">{value}</Text>
    {caption ? (
      <Text className="mt-1 font-mregular text-[10px] text-gray">
        {caption}
      </Text>
    ) : null}
  </View>
);

const ActionButton = ({
  label,
  icon,
  onPress,
  loading,
  destructive,
}: {
  label: string;
  icon?: "pencil-box-outline" | "pencil" | "pause" | "play" | "refresh";
  onPress: () => void;
  loading?: boolean;
  destructive?: boolean;
}) => (
  <Pressable
    accessibilityRole="button"
    disabled={loading}
    onPress={onPress}
    className={`h-10 min-w-24 flex-row items-center justify-center gap-1 rounded-lg border px-3 active:opacity-70 ${destructive ? "border-red-600" : "border-green"} ${loading ? "opacity-50" : ""}`}
  >
    {loading ? (
      <ActivityIndicator
        size="small"
        color={destructive ? "#DC2626" : "#218225"}
      />
    ) : (
      <>
        {icon ? (
          <MaterialCommunityIcons
            name={icon}
            size={15}
            color={destructive ? "#DC2626" : "#218225"}
          />
        ) : null}
        <Text
          className={`font-msbold text-xs ${destructive ? "text-red-600" : "text-green"}`}
        >
          {label}
        </Text>
      </>
    )}
  </Pressable>
);

const SubscriptionCard = ({
  subscription,
  pausingId,
  cancellingId,
  renewalId,
  onPause,
  onResume,
  onCancel,
  onRenew,
}: {
  subscription: CustomerSubscription;
  pausingId: string | null;
  cancellingId: string | null;
  renewalId: string | null;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (subscription: CustomerSubscription) => void;
  onRenew: (id: string) => void;
}) => {
  const statusStyle = getStatusStyle(subscription.status);
  const isPausing = pausingId === subscription.id;
  const isCancelling = cancellingId === subscription.id;
  const isRenewing = renewalId === subscription.id;

  return (
    <View className="rounded-2xl bg-white p-4">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="min-w-0 flex-1 font-mbold text-lg">
          {formatEnum(subscription.status)} Plan
        </Text>
        <View className={`rounded-full px-3 py-1.5 ${statusStyle.background}`}>
          <Text className={`font-msbold text-[10px] ${statusStyle.text}`}>
            {formatEnum(subscription.status)}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap justify-between">
        <SubscriptionValue label="Plan" value={subscription.planName || "N/A"} />
        <SubscriptionValue
          label="Weight"
          value={subscription.boxWeight || "N/A"}
        />
        <SubscriptionValue
          label="Frequency"
          value={getFrequencyWeeksString(subscription.frequency)}
          caption={`${displayCurrency(subscription.price, "NGN")}/cycle`}
        />
      </View>

      <View className="border-t border-gray-100 pt-4">
        <Text className="font-msbold text-sm">
          Next Billing At:{" "}
          <Text className="text-green">
            {formatDate(subscription.nextBillingAt, "dd MMM yyyy")}
          </Text>
        </Text>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {subscription.status === "pending_payment" ||
        subscription.status === "failed" ? (
          <ActionButton
            label="Renew Subscription"
            icon="refresh"
            loading={isRenewing}
            onPress={() => onRenew(subscription.id)}
          />
        ) : null}

        <ActionButton
          label="Change Plan"
          icon="pencil"
          onPress={() => router.push("/(protected)/(tabs)/Plans")}
        />

        {subscription.status === "paused" ? (
          <ActionButton
            label="Resume"
            icon="play"
            loading={isPausing}
            onPress={() => onResume(subscription.id)}
          />
        ) : subscription.status === "active" ? (
          <ActionButton
            label="Pause"
            icon="pause"
            loading={isPausing}
            onPress={() => onPause(subscription.id)}
          />
        ) : null}

        {subscription.status !== "cancelled" ? (
          <ActionButton
            label="Cancel Subscription"
            destructive
            loading={isCancelling}
            onPress={() => onCancel(subscription)}
          />
        ) : (
          <Text className="self-center font-msbold text-xs text-red-600">
            Subscription Cancelled
          </Text>
        )}
      </View>
    </View>
  );
};

const MySubscriptionsScreen = () => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const latestRequestRef = useRef(0);
  const userIdRef = useRef<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [meta, setMeta] = useState<OrderMeta>(emptyMeta);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pausingId, setPausingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [renewalId, setRenewalId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const getUserId = useCallback(async () => {
    if (userIdRef.current) return userIdRef.current;
    const response = await axiosClient.get("/users/me");
    const userId = response.data?.data?.id;
    if (!userId) throw new Error("Unable to identify your account.");
    userIdRef.current = String(userId);
    return userIdRef.current;
  }, []);

  const getSubscriptions = useCallback(
    async (page = 1, append = false, isRefresh = false) => {
      const requestId = append
        ? latestRequestRef.current
        : latestRequestRef.current + 1;
      if (!append) latestRequestRef.current = requestId;

      try {
        if (append) setLoadingMore(true);
        else if (isRefresh) setRefreshing(true);
        else setInitialLoading(true);
        setError(null);

        const userId = await getUserId();
        const response = await axiosClient.get(
          `/subscriptions/by-user/${userId}`,
          {
            params: {
              page,
              limit: PAGE_SIZE,
              ...(selectedFilter !== "all"
                ? { status: selectedFilter }
                : {}),
              ...(debouncedSearch ? { search: debouncedSearch } : {}),
            },
          },
        );

        if (requestId !== latestRequestRef.current) return;
        const mapped: CustomerSubscription[] = (response.data?.data ?? []).map(
          (subscription: any) => {
            const attributes = subscription.attributes ?? {};
            return {
              id: String(subscription.id),
              status: attributes.status ?? "unknown",
              planName: attributes.plan_name ?? "",
              boxWeight:
                attributes.box_weight === undefined ||
                attributes.box_weight === null
                  ? ""
                  : String(attributes.box_weight),
              frequency: Number(attributes.frequency) || 0,
              price: Number(attributes.price) || 0,
              nextBillingAt: attributes.next_billing_at ?? null,
            };
          },
        );

        setSubscriptions((current) =>
          append ? [...current, ...mapped] : mapped,
        );
        const responseMeta = response.data?.meta;
        setMeta({
          total: Number(responseMeta?.total) || 0,
          totalPages: Number(responseMeta?.totalPages) || 0,
          currentPage: Number(responseMeta?.currentPage) || page,
          pageSize: Number(responseMeta?.pageSize) || PAGE_SIZE,
        });
      } catch (requestError: any) {
        if (requestId !== latestRequestRef.current) return;
        const message =
          requestError.response?.data?.message ??
          requestError.message ??
          "Failed to load subscriptions.";
        if (append || isRefresh) toast.show(message, { type: "danger" });
        else setError(message);
      } finally {
        if (requestId === latestRequestRef.current) {
          setInitialLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [debouncedSearch, getUserId, selectedFilter, toast],
  );

  useEffect(() => {
    void getSubscriptions();
  }, [getSubscriptions]);

  const refreshAfterAction = async () => {
    await getSubscriptions(1, false, true);
  };

  const pauseSubscription = async (id: string) => {
    try {
      setPausingId(id);
      await axiosClient.patch(`/subscriptions/${id}/pause`);
      toast.show("Subscription paused.", { type: "success" });
      await refreshAfterAction();
    } catch (requestError: any) {
      toast.show(
        requestError.response?.data?.message ?? "Failed to pause subscription.",
        { type: "danger" },
      );
    } finally {
      setPausingId(null);
    }
  };

  const resumeSubscription = async (id: string) => {
    try {
      setPausingId(id);
      await axiosClient.patch(`/subscriptions/${id}/resume`);
      toast.show("Subscription resumed.", { type: "success" });
      await refreshAfterAction();
    } catch (requestError: any) {
      toast.show(
        requestError.response?.data?.message ??
          "Failed to resume subscription.",
        { type: "danger" },
      );
    } finally {
      setPausingId(null);
    }
  };

  const cancelSubscription = async (id: string) => {
    try {
      setCancellingId(id);
      await axiosClient.patch(`/subscriptions/${id}/cancel`);
      toast.show("Subscription cancelled.", { type: "success" });
      await refreshAfterAction();
    } catch (requestError: any) {
      toast.show(
        requestError.response?.data?.message ??
          "Failed to cancel subscription.",
        { type: "danger" },
      );
    } finally {
      setCancellingId(null);
    }
  };

  const confirmCancel = (subscription: CustomerSubscription) => {
    Alert.alert(
      "Cancel subscription?",
      "This action cannot be undone.",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: () => void cancelSubscription(subscription.id),
        },
      ],
    );
  };

  const renewSubscription = async (id: string) => {
    try {
      setRenewalId(id);
      const response = await axiosClient.post(`/subscriptions/${id}/pay`);
      const attributes = response.data?.data?.attributes;
      const paymentLink =
        attributes?.authorization_url ?? attributes?.payment?.authorization_url;

      if (!paymentLink) {
        toast.show("The payment link was not returned. Please try again.", {
          type: "danger",
        });
        return;
      }
      await WebBrowser.openBrowserAsync(paymentLink);
    } catch (requestError: any) {
      toast.show(
        requestError.response?.data?.message ??
          "Failed to initialize payment.",
        { type: "danger" },
      );
    } finally {
      setRenewalId(null);
    }
  };

  const loadMore = async () => {
    if (
      initialLoading ||
      refreshing ||
      loadingMore ||
      meta.currentPage >= meta.totalPages
    ) {
      return;
    }
    await getSubscriptions(meta.currentPage + 1, true);
  };

  const hasFilters = selectedFilter !== "all" || Boolean(debouncedSearch);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <HomeListHeader
        title="My Subscriptions"
        subtitle="Manage your plan, size, and delivery preferences."
        searchPlaceholder="Search..."
        filters={subscriptionFilters}
        selectedFilter={selectedFilter}
        searchValue={searchValue}
        onFilterChange={setSelectedFilter}
        onSearchChange={setSearchValue}
      />
      <FlatList
        data={initialLoading || error ? [] : subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            subscription={item}
            pausingId={pausingId}
            cancellingId={cancellingId}
            renewalId={renewalId}
            onPause={(id) => void pauseSubscription(id)}
            onResume={(id) => void resumeSubscription(id)}
            onCancel={confirmCancel}
            onRenew={(id) => void renewSubscription(id)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void getSubscriptions(1, false, true)}
            colors={["#218225"]}
            tintColor="#218225"
          />
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 20,
        }}
        ListEmptyComponent={
          <View className="min-h-64 items-center justify-center rounded-xl bg-white px-6">
            {initialLoading ? (
              <>
                <ActivityIndicator size="small" color="#218225" />
                <Text className="mt-2 font-mregular text-xs text-gray">
                  Loading subscriptions...
                </Text>
              </>
            ) : error ? (
              <>
                <MaterialCommunityIcons
                  name="cube-off-outline"
                  size={30}
                  color="#999999"
                />
                <Text className="mt-3 text-center font-mregular text-xs text-gray">
                  {error}
                </Text>
                <RetryButton
                  onPress={() => void getSubscriptions()}
                  containerStyles="mt-4"
                />
              </>
            ) : (
              <>
                <View className="size-15 items-center justify-center rounded-full bg-green-light">
                  <MaterialCommunityIcons name="cube" size={29} color="#218225" />
                </View>
                <Text className="mt-4 font-mbold text-base">
                  {hasFilters ? "No Results Found" : "No Active Subscription"}
                </Text>
                <Text className="mt-1 text-center font-mregular text-xs leading-5 text-gray">
                  {hasFilters
                    ? "Try changing your search or status filter."
                    : "Start your first subscription to get premium meat delivered."}
                </Text>
                {!hasFilters ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push("/(protected)/(tabs)/Plans")}
                    className="mt-6 h-11 items-center justify-center rounded-lg bg-green px-6 active:opacity-80"
                  >
                    <Text className="font-mbold text-xs text-white">
                      Choose a Plan
                    </Text>
                  </Pressable>
                ) : null}
              </>
            )}
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="items-center py-5">
              <ActivityIndicator size="small" color="#218225" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default MySubscriptionsScreen;
