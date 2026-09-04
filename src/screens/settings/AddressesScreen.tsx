import RetryButton from "@/components/RetryButton";
import {
  SettingsHeader,
  SettingsScreenRoot,
} from "@/components/settings/SettingsShell";
import { axiosClient } from "@/globalApi";
import type {
  ApiAddress,
  SavedAddress,
  SavedAddressCardProps,
} from "@/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useToast } from "react-native-toast-notifications";

const mapSavedAddress = (address: ApiAddress): SavedAddress => {
  const attributes = address.attributes ?? {};
  const addressText = [
    attributes.apartment_suite,
    attributes.street_address,
    attributes.city,
    attributes.state,
    attributes.zip_code,
    attributes.country,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: String(address.id),
    label:
      attributes.label ||
      (attributes.address_type
        ? `${attributes.address_type.charAt(0).toUpperCase()}${attributes.address_type.slice(1)}`
        : "Address"),
    address: addressText || "Address details unavailable",
    isDefault: attributes.is_default ?? false,
  };
};

const SavedAddressCard = ({
  item,
  onEdit,
  onRemove,
  onSetDefault,
  isRemoving,
  isSettingDefault,
}: SavedAddressCardProps) => {
  const actionDisabled = isRemoving || isSettingDefault;

  return (
    <View className="rounded-2xl bg-white p-4">
      <View className="flex-row items-center">
        <View className="size-9 items-center justify-center rounded-full bg-green-light">
          <MaterialCommunityIcons name="map-marker" size={19} color="#218225" />
        </View>
        <Text className="ml-3 flex-1 font-mbold text-lg">{item.label}</Text>
        {item.isDefault ? (
          <View className="rounded-full bg-green-light px-3 py-2">
            <Text className="font-msbold text-xs text-green">Default</Text>
          </View>
        ) : null}
      </View>

      <Text className="mt-4 font-mregular text-base text-gray">
        {item.address}
      </Text>

      <View className="mt-5 flex-row flex-wrap gap-2">
        <Pressable
          accessibilityRole="button"
          disabled={actionDisabled}
          onPress={() => onEdit(item)}
          style={{ flexShrink: 0 }}
          className={`min-h-10 flex-row items-center justify-center gap-1 rounded-lg border border-green px-2 active:opacity-70 ${actionDisabled ? "opacity-50" : ""}`}
        >
          <MaterialCommunityIcons
            name="pencil-box-outline"
            size={17}
            color="#218225"
          />
          <Text className="font-msbold text-xs text-green">Edit</Text>
        </Pressable>

        {!item.isDefault ? (
          <Pressable
            accessibilityRole="button"
            disabled={actionDisabled}
            onPress={() => onSetDefault(item)}
            style={{ flexShrink: 0 }}
            className={`min-h-10 min-w-24 items-center justify-center rounded-lg border border-green px-2 active:opacity-70 ${actionDisabled ? "opacity-50" : ""}`}
          >
            {isSettingDefault ? (
              <ActivityIndicator size="small" color="#218225" />
            ) : (
              <Text className="font-msbold text-xs text-green">
                Set as Default
              </Text>
            )}
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={actionDisabled}
          onPress={() => onRemove(item)}
          style={{ flexShrink: 0 }}
          className={`min-h-10 min-w-20 flex-row items-center justify-center gap-1 rounded-lg border border-red-600 px-2 active:opacity-70 ${actionDisabled ? "opacity-50" : ""}`}
        >
          {isRemoving ? (
            <ActivityIndicator size="small" color="#E7000B" />
          ) : (
            <>
              <MaterialCommunityIcons name="delete" size={15} color="#E7000B" />
              <Text className="font-msbold text-xs text-red-600">
                Remove
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const AddressesScreen = () => {
  const toast = useToast();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const fetchAddresses = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setInitialLoading(true);
      }
      setError(null);

      const response = await axiosClient.get("/addresses");
      const apiAddresses: ApiAddress[] = response.data?.data ?? [];
      setAddresses(apiAddresses.map(mapSavedAddress));
    } catch (requestError: any) {
      const message =
        requestError.response?.data?.message ?? "Failed to load addresses.";
      setError(message);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchAddresses();
    }, [fetchAddresses]),
  );

  const editAddress = (item: SavedAddress) => {
    router.push({
      pathname: "/(protected)/(tabs)/Settings/EditAddress",
      params: { id: item.id },
    });
  };

  const deleteAddress = async (item: SavedAddress) => {
    try {
      setRemovingId(item.id);
      await axiosClient.delete(`/addresses/${item.id}`);
      setAddresses((current) =>
        current.filter((address) => address.id !== item.id),
      );
      toast.show("Address deleted successfully.", { type: "success" });
    } catch (requestError: any) {
      toast.show(
        requestError.response?.data?.message ?? "Failed to delete address.",
        { type: "danger" },
      );
    } finally {
      setRemovingId(null);
    }
  };

  const confirmDelete = (item: SavedAddress) => {
    Alert.alert(
      "Remove address?",
      `Are you sure you want to remove ${item.label}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => void deleteAddress(item),
        },
      ],
    );
  };

  const setDefaultAddress = async (item: SavedAddress) => {
    try {
      setSettingDefaultId(item.id);
      await axiosClient.patch(`/addresses/${item.id}/set-default`);
      setAddresses((current) =>
        current.map((address) => ({
          ...address,
          isDefault: address.id === item.id,
        })),
      );
      toast.show("Address set as default.", { type: "success" });
    } catch (requestError: any) {
      toast.show(
        requestError.response?.data?.message ??
          "Failed to set the default address.",
        { type: "danger" },
      );
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <SettingsScreenRoot>
      <SettingsHeader
        title="Delivery Addresses"
        subtitle="Manage your saved delivery locations."
      />
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SavedAddressCard
            item={item}
            onEdit={editAddress}
            onRemove={confirmDelete}
            onSetDefault={(address) => void setDefaultAddress(address)}
            isRemoving={removingId === item.id}
            isSettingDefault={settingDefaultId === item.id}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void fetchAddresses(true)}
            colors={["#218225"]}
            tintColor="#218225"
          />
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}
        ListHeaderComponent={
          <View className="mb-6 mt-3 items-end">
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push("/(protected)/(tabs)/Settings/AddAddress")
              }
              className="h-11 flex-row items-center justify-center gap-2 rounded-lg bg-green px-5 active:opacity-70"
            >
              <MaterialCommunityIcons name="plus" size={20} color="white" />
              <Text className="font-mbold text-base text-white">
                Add Address
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 pb-24">
            {initialLoading ? (
              <>
                <ActivityIndicator size="small" color="#218225" />
                <Text className="mt-2 font-mregular text-xs text-gray">
                  Loading addresses...
                </Text>
              </>
            ) : error ? (
              <>
                <MaterialCommunityIcons
                  name="map-marker-alert-outline"
                  size={30}
                  color="#999999"
                />
                <Text className="mt-2 text-center font-mregular text-sm text-gray">
                  {error}
                </Text>
                <RetryButton
                  onPress={() => void fetchAddresses()}
                  containerStyles="mt-4"
                />
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="map-marker-plus-outline"
                  size={34}
                  color="#218225"
                />
                <Text className="mt-3 text-center font-mregular text-sm text-gray">
                  You have no saved addresses yet.
                </Text>
              </>
            )}
          </View>
        }
      />
    </SettingsScreenRoot>
  );
};

export default AddressesScreen;
