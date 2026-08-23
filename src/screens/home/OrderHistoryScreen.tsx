import CustomButtomSheet from "@/components/CustomButtomSheet";
import RetryButton from "@/components/RetryButton";
import HomeListHeader from "@/components/home/HomeListHeader";
import { axiosClient } from "@/globalApi";
import type {
  CustomerOrder,
  HomeFilterItem,
  OrderItem,
  OrderMeta,
} from "@/types";
import { formatDate } from "@/utils/DateLabels";
import displayCurrency from "@/utils/displayCurrency";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";

const PAGE_SIZE = 20;

const orderFilters: HomeFilterItem[] = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "payment_failed", label: "Payment Failed" },
  { id: "pending", label: "Pending" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
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
    case "paid":
    case "delivered":
      return { background: "bg-[#E8F5EC]", text: "text-[#218225]" };
    case "shipped":
      return { background: "bg-blue-50", text: "text-blue-700" };
    case "pending":
      return { background: "bg-amber-50", text: "text-amber-700" };
    case "payment_failed":
    case "cancelled":
      return { background: "bg-red-50", text: "text-red-700" };
    default:
      return { background: "bg-gray-100", text: "text-gray" };
  }
};

const getItemName = (item: OrderItem, index: number) => {
  const attributes = item.attributes as
    | { name?: string; product_name?: string }
    | undefined;
  return (
    item.name ||
    item.product_name ||
    attributes?.name ||
    attributes?.product_name ||
    `Item ${index + 1}`
  );
};

const getItemQuantity = (item: OrderItem) => {
  const attributes = item.attributes as { quantity?: number } | undefined;
  return Number(item.quantity ?? attributes?.quantity) || 1;
};

const getItemPrice = (item: OrderItem) => {
  const attributes = item.attributes as
    | { price?: number; amount?: number }
    | undefined;
  const value = Number(
    item.price ?? item.amount ?? attributes?.price ?? attributes?.amount,
  );
  return Number.isFinite(value) ? value : null;
};

const getRecordValue = (
  record: Record<string, unknown> | null,
  key: string,
  fallback = "N/A",
) => {
  const value = record?.[key];
  return value === undefined || value === null || value === ""
    ? fallback
    : String(value);
};

const SectionTitle = ({ children }: { children: string }) => (
  <Text className="mb-3 mt-5 font-mbold text-lg">{children}</Text>
);

const DetailCell = ({ label, value }: { label: string; value: string }) => (
  <View className="mb-4" style={{ width: "48%" }}>
    <Text className="font-mregular text-[10px] uppercase tracking-wide text-gray">
      {label}
    </Text>
    <Text className="mt-1 font-msbold text-sm text-[#292929]">{value}</Text>
  </View>
);

const OrderStatusBadge = ({ status }: { status: string }) => {
  const style = getStatusStyle(status);
  return (
    <View className={`rounded-full px-3 py-1.5 ${style.background}`}>
      <Text className={`font-msbold text-[10px] ${style.text}`}>
        {formatEnum(status || "unknown")}
      </Text>
    </View>
  );
};

const OrderCard = ({
  order,
  onView,
  onCopyId,
}: {
  order: CustomerOrder;
  onView: (order: CustomerOrder) => void;
  onCopyId: (orderId: string) => void;
}) => (
  <View className="rounded-2xl bg-white p-4">
    <View className="flex-row items-start justify-between gap-3">
      <View className="min-w-0 flex-1 flex-row items-center">
        <View className="size-10 items-center justify-center rounded-full bg-green-light">
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={20}
            color="#218225"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Copy order ID ${order.id}`}
          onPress={() => onCopyId(order.id)}
          className="ml-3 min-w-0 flex-1 active:opacity-60"
        >
          <View className="flex-row items-center">
            <Text className="font-mregular text-[10px] text-gray">
              Order ID
            </Text>
            <View className="ml-1 size-5 items-center justify-center">
              <MaterialCommunityIcons
                name="content-copy"
                size={12}
                color="#218225"
              />
            </View>
          </View>
          <Text className="font-mbold text-sm">
            {order.id}
          </Text>
        </Pressable>
      </View>
      <OrderStatusBadge status={order.status} />
    </View>

    <View className="mt-5 flex-row flex-wrap justify-between">
      <DetailCell
        label="Date"
        value={formatDate(order.createdAt, "dd MMM yyyy")}
      />
      <DetailCell
        label="Items"
        value={`${order.items.length} item${order.items.length === 1 ? "" : "s"}`}
      />
      <DetailCell
        label="Order Type"
        value={formatEnum(order.orderType || "N/A")}
      />
      <DetailCell
        label="Total"
        value={displayCurrency(order.totalAmount, "NGN")}
      />
    </View>

    <Pressable
      accessibilityRole="button"
      onPress={() => onView(order)}
      className="mt-1 h-10 flex-row items-center justify-center rounded-lg border border-green active:opacity-70"
    >
      <Text className="font-msbold text-xs text-green">View Order</Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color="#218225"
      />
    </Pressable>
  </View>
);

const OrderHistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const detailsRef = useRef<BottomSheetModal>(null);
  const latestRequestRef = useRef(0);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [meta, setMeta] = useState<OrderMeta>(emptyMeta);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detailSnapPoints = useMemo(() => ["85%"], []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const getOrders = useCallback(
    async (page = 1, append = false, isRefresh = false) => {
      const requestId = append
        ? latestRequestRef.current
        : latestRequestRef.current + 1;
      if (!append) latestRequestRef.current = requestId;

      try {
        if (append) {
          setLoadingMore(true);
        } else if (isRefresh) {
          setRefreshing(true);
        } else {
          setInitialLoading(true);
        }
        setError(null);

        const response = await axiosClient.get("/orders/my-orders", {
          params: {
            page,
            limit: PAGE_SIZE,
            ...(selectedFilter !== "all" ? { status: selectedFilter } : {}),
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
          },
        });

        if (requestId !== latestRequestRef.current) return;

        const mappedOrders: CustomerOrder[] = (response.data?.data ?? []).map(
          (order: any) => {
            const attributes = order.attributes ?? {};
            return {
              id: String(order.id),
              createdAt: attributes.createdAt ?? null,
              updatedAt: attributes.updatedAt ?? null,
              items: Array.isArray(attributes.items) ? attributes.items : [],
              orderType: attributes.order_type ?? "",
              totalAmount: Number(attributes.total_amount) || 0,
              deliveryFee: Number(attributes.delivery_fee) || 0,
              planId:
                attributes.plan_id === undefined || attributes.plan_id === null
                  ? null
                  : String(attributes.plan_id),
              giftBoxId:
                attributes.gift_box_id === undefined ||
                attributes.gift_box_id === null
                  ? null
                  : String(attributes.gift_box_id),
              deliveryDate: attributes.delivery_date ?? null,
              deliveryWindowLabel:
                attributes.delivery_window_label ?? null,
              deliveryDistanceKm:
                attributes.delivery_distance_km ?? null,
              deliveryAddressSnapshot:
                attributes.delivery_address_snapshot ?? null,
              status: attributes.status ?? "unknown",
              user:
                order.relationships?.userDetails?.data?.attributes ?? null,
              plan:
                order.relationships?.planDetails?.data?.attributes ?? null,
              giftBoxDetails:
                order.relationships?.giftBoxDetails?.data?.attributes ?? null,
              giftFormDetails:
                order.relationships?.giftDetails?.data?.attributes ?? null,
              attributes,
            };
          },
        );

        setOrders((current) =>
          append ? [...current, ...mappedOrders] : mappedOrders,
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
          requestError.response?.data?.message ?? "Failed to load orders.";
        if (append || isRefresh) {
          toast.show(message, { type: "danger" });
        } else {
          setError(message);
        }
      } finally {
        if (requestId === latestRequestRef.current) {
          setInitialLoading(false);
          setRefreshing(false);
          setLoadingMore(false);
        }
      }
    },
    [debouncedSearch, selectedFilter, toast],
  );

  useEffect(() => {
    void getOrders();
  }, [getOrders]);

  const loadMoreOrders = async () => {
    if (
      initialLoading ||
      refreshing ||
      loadingMore ||
      meta.currentPage >= meta.totalPages
    ) {
      return;
    }
    await getOrders(meta.currentPage + 1, true);
  };

  const viewOrder = (order: CustomerOrder) => {
    setSelectedOrder(order);
    detailsRef.current?.present();
  };

  const copyOrderId = async (orderId: string) => {
    await Clipboard.setStringAsync(orderId);
    toast.show("Order ID copied!", { type: "success" });
  };

  const hasFilters = selectedFilter !== "all" || Boolean(debouncedSearch);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <HomeListHeader
        title="Order History"
        subtitle="Track your past and upcoming deliveries."
        filters={orderFilters}
        selectedFilter={selectedFilter}
        searchValue={searchValue}
        onFilterChange={setSelectedFilter}
        onSearchChange={setSearchValue}
        onBackPress={() => {
          router.dismissTo("/(protected)/(tabs)/Home");
        }}
      />

      <FlatList
        data={initialLoading || error ? [] : orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onView={viewOrder}
            onCopyId={(orderId) => void copyOrderId(orderId)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        onEndReached={() => void loadMoreOrders()}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void getOrders(1, false, true)}
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
                  Loading orders...
                </Text>
              </>
            ) : error ? (
              <>
                <MaterialCommunityIcons
                  name="package-variant-closed-remove"
                  size={30}
                  color="#999999"
                />
                <Text className="mt-3 text-center font-mregular text-xs text-gray">
                  {error}
                </Text>
                <RetryButton
                  onPress={() => void getOrders()}
                  containerStyles="mt-4"
                />
              </>
            ) : (
              <>
                <View className="size-15 items-center justify-center rounded-full bg-green-light">
                  <MaterialCommunityIcons
                    name="package-variant-closed"
                    size={29}
                    color="#218225"
                  />
                </View>
                <Text className="mt-4 font-mbold text-base">
                  {hasFilters ? "No Results Found" : "No Orders Yet"}
                </Text>
                <Text className="mt-1 text-center font-mregular text-xs leading-5 text-gray">
                  {hasFilters
                    ? "Try changing your search or status filter."
                    : "Your past and upcoming deliveries will appear here."}
                </Text>
                {!hasFilters ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push("/(protected)/(tabs)/Plans")}
                    className="mt-6 h-11 items-center justify-center rounded-lg bg-green px-6 active:opacity-80"
                  >
                    <Text className="font-mbold text-xs text-white">
                      Browse Plans
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

      <CustomButtomSheet
        ref={detailsRef}
        snapPoints={detailSnapPoints}
        dynamicSizing={false}
        scrollable
        onDismiss={() => setSelectedOrder(null)}
      >
        <View className="h-full">
          <Text className="font-msbold text-lg mb-2">
            Order Type: {formatEnum(selectedOrder?.orderType || "N/A")}
          </Text>

          {selectedOrder ? (
            <BottomSheetFlatList
              data={selectedOrder.items}
              keyExtractor={(item, index) =>
                String(item.product_id ?? item.id ?? index)
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 10, paddingBottom: 28 }}
              ListHeaderComponent={
                <>
              <View className="rounded-xl bg-white p-4">
                <View className="flex-row flex-wrap justify-between">
                  {selectedOrder.orderType === "plan" ||
                  selectedOrder.orderType === "subscription" ? (
                    <>
                      <DetailCell
                        label="Plan"
                        value={getRecordValue(selectedOrder.plan, "name")}
                      />
                      <DetailCell
                        label="Plan ID"
                        value={selectedOrder.planId ?? "N/A"}
                      />
                    </>
                  ) : null}
                  {selectedOrder.orderType === "gift" ? (
                    <DetailCell
                      label="Gift Box ID"
                      value={selectedOrder.giftBoxId ?? "N/A"}
                    />
                  ) : null}
                  <DetailCell
                    label="Delivery Fee"
                    value={displayCurrency(selectedOrder.deliveryFee, "NGN")}
                  />
                  <DetailCell
                    label="Total Amount"
                    value={displayCurrency(selectedOrder.totalAmount, "NGN")}
                  />
                  <DetailCell
                    label="Status"
                    value={formatEnum(selectedOrder.status || "N/A")}
                  />
                  <DetailCell
                    label="Date Created"
                    value={formatDate(
                      selectedOrder.createdAt,
                      "dd MMM yyyy",
                    )}
                  />
                  <DetailCell
                    label="Last Updated"
                    value={formatDate(selectedOrder.updatedAt, "dd MMM yyyy")}
                  />
                </View>
              </View>

              <SectionTitle>Products</SectionTitle>
                </>
              }
              ItemSeparatorComponent={() => <View className="h-3" />}
              renderItem={({ item, index }) => {
                  const price = getItemPrice(item);
                  return (
                    <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-4">
                        {item.image_url ? (
                          <Image
                            source={{ uri: item.image_url }}
                            contentFit="cover"
                            transition={200}
                            style={{ width: "100%", height: 128, borderRadius: 12 }}
                          />
                        ) : (
                          <View className="h-32 items-center justify-center rounded-xl bg-green-light">
                            <MaterialCommunityIcons
                              name="food-steak"
                              size={32}
                              color="#218225"
                            />
                          </View>
                        )}
                        <Text className="mt-3 font-mbold text-sm">
                          {getItemName(item, index)}
                        </Text>
                        <Text className="mt-1 font-msbold text-xs text-gray">
                          Item type: {formatEnum(item.item_type || "N/A")}
                        </Text>
                        <Text className="mt-1 font-msbold text-xs text-gray">
                          {item.weight ?? "N/A"}
                          {item.weight_unit ?? ""}
                        </Text>
                        {item.is_prefilled ? (
                          <Text className="mt-1 font-msbold text-xs text-green">
                            Prefilled
                          </Text>
                        ) : price !== null ? (
                          <Text className="mt-1 font-msbold text-xs text-green">
                            {displayCurrency(price, "NGN")}
                          </Text>
                        ) : null}
                        <Text className="mt-1 font-msbold text-xs text-gray">
                          Qty: {getItemQuantity(item)}
                        </Text>
                    </View>
                  );
                }}
              ListEmptyComponent={
                  <Text className="font-mregular text-xs text-gray">
                    No prefilled items added on this order.
                  </Text>
                }
              ListFooterComponent={
                <>
              {selectedOrder.orderType === "gift" ? (
                <>
                  <SectionTitle>Gift Information</SectionTitle>
                  <View className="flex-row flex-wrap justify-between rounded-xl bg-white p-4">
                    <DetailCell
                      label="Gift Box Name"
                      value={getRecordValue(
                        selectedOrder.giftBoxDetails,
                        "name",
                      )}
                    />
                    <DetailCell
                      label="Price"
                      value={displayCurrency(
                        Number(selectedOrder.giftBoxDetails?.price) || 0,
                        "NGN",
                      )}
                    />
                    <DetailCell
                      label="Status"
                      value={
                        selectedOrder.giftBoxDetails?.is_active
                          ? "Active"
                          : "Inactive"
                      }
                    />
                    <DetailCell
                      label="Recipient Name"
                      value={getRecordValue(
                        selectedOrder.giftFormDetails,
                        "recipient_name",
                      )}
                    />
                    <DetailCell
                      label="Recipient Phone No."
                      value={getRecordValue(
                        selectedOrder.giftFormDetails,
                        "recipient_phone",
                      )}
                    />
                    <DetailCell
                      label="Recipient Email"
                      value={getRecordValue(
                        selectedOrder.giftFormDetails,
                        "recipient_email",
                      )}
                    />
                    <DetailCell
                      label="Occasion"
                      value={getRecordValue(
                        selectedOrder.giftFormDetails,
                        "occasion",
                      )}
                    />
                    <DetailCell
                      label="Delivery Date"
                      value={formatDate(
                        selectedOrder.deliveryDate,
                        "dd MMM yyyy",
                      )}
                    />
                    <DetailCell
                      label="Delivery Window"
                      value={selectedOrder.deliveryWindowLabel ?? "N/A"}
                    />
                    <DetailCell
                      label="Gift Status"
                      value={getRecordValue(
                        selectedOrder.giftFormDetails,
                        "status",
                      )}
                    />
                    <DetailCell
                      label="Order ID"
                      value={getRecordValue(
                        selectedOrder.giftFormDetails,
                        "order_id",
                      )}
                    />
                    <DetailCell
                      label="Message"
                      value={getRecordValue(
                        selectedOrder.giftFormDetails,
                        "message",
                        "None",
                      )}
                    />
                  </View>
                </>
              ) : null}

              <SectionTitle>Delivery Address</SectionTitle>
              <View className="flex-row flex-wrap justify-between rounded-xl bg-white p-4">
                <DetailCell
                  label="Name"
                  value={`${getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "first_name",
                    "",
                  )} ${getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "last_name",
                    "",
                  )}`.trim() || "N/A"}
                />
                <DetailCell
                  label="Email"
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "email",
                  )}
                />
                <DetailCell
                  label="Phone No."
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "phone",
                  )}
                />
                <DetailCell
                  label="Apartment Suite"
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "apartment_suite",
                  )}
                />
                <DetailCell
                  label="Street Address"
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "street_address",
                  )}
                />
                <DetailCell
                  label="City"
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "city",
                  )}
                />
                <DetailCell
                  label="State"
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "state",
                  )}
                />
                <DetailCell
                  label="Zip Code"
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "zip_code",
                  )}
                />
                <DetailCell
                  label="Country"
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "country",
                  )}
                />
                <DetailCell
                  label="Delivery Distance (km)"
                  value={
                    selectedOrder.deliveryDistanceKm === null
                      ? "N/A"
                      : `${selectedOrder.deliveryDistanceKm}km`
                  }
                />
                <DetailCell
                  label="Latitude"
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "latitude",
                  )}
                />
                <DetailCell
                  label="Longitude"
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "longitude",
                  )}
                />
                <DetailCell
                  label="Address Type"
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "address_type",
                  )}
                />
                <DetailCell
                  label="Address Label"
                  value={getRecordValue(
                    selectedOrder.deliveryAddressSnapshot,
                    "label",
                  )}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => detailsRef.current?.dismiss()}
                className="mt-5 h-11 items-center justify-center rounded-lg border border-green bg-white active:opacity-70"
              >
                <Text className="font-mbold text-xs text-green">Close</Text>
              </Pressable>
                </>
              }
            />
          ) : null}
        </View>
      </CustomButtomSheet>
    </View>
  );
};

export default OrderHistoryScreen;
