import type { CustomBottomSheetRef } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import CustomButtomSheet from "./CustomButtomSheet";
import RetryButton from "./RetryButton";

export type SavedAddress = {
  id: string;
  label: string;
  recipient: string;
  email?: string;
  phone: string;
  streetAddress: string;
  apartment: string;
  deliveryArea: string;
  state: string;
  zipCode: string;
};

type SavedAddressSheetProps = {
  addresses?: SavedAddress[];
  selectedAddressId?: string;
  onSelect: (address: SavedAddress) => void;
  onEnterManually?: () => void;
  refreshing?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

export const SAVED_ADDRESS_PLACEHOLDER = "Select a saved address";

const SavedAddressSheet = forwardRef<
  CustomBottomSheetRef,
  SavedAddressSheetProps
>(
  ({
    addresses = [],
    selectedAddressId,
    onSelect,
    onEnterManually,
    refreshing = false,
    error,
    onRefresh,
  }, ref) => {
  const snapPoints = useMemo(() => ["90%"], []);

  return (
    <CustomButtomSheet
      ref={ref}
      snapPoints={snapPoints}
      dynamicSizing={false}
      scrollable
    >
      <View className="h-full">
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 font-mbold text-2xl">Saved addresses</Text>
          {onRefresh ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh saved addresses"
              accessibilityState={{ disabled: refreshing }}
              disabled={refreshing}
              onPress={onRefresh}
              className="h-10 w-10 items-center justify-center rounded-full bg-green-light active:opacity-70"
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#218225" />
              ) : (
                <Ionicons name="refresh" size={21} color="#218225" />
              )}
            </Pressable>
          ) : null}
        </View>
        <Text className="mb-4 font-mregular text-sm text-gray">
          Choose an address for this delivery.
        </Text>
        <BottomSheetFlatList
          data={addresses}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          ListHeaderComponent={
            onEnterManually ? (
              <Pressable
                accessibilityRole="button"
                onPress={onEnterManually}
                className="mb-3 rounded-lg border border-gray-200 bg-white p-4 active:opacity-80"
              >
                <Text className="font-msbold text-base text-green">
                  Enter address manually
                </Text>
              </Pressable>
            ) : null
          }
          ListEmptyComponent={
            error ? (
              <View className="items-center px-4 py-8">
                <Ionicons name="cloud-offline-outline" size={30} color="#B52227" />
                <Text className="mt-3 text-center font-mregular text-sm leading-5 text-gray">
                  {error}
                </Text>
                {onRefresh ? (
                  <RetryButton
                    onPress={onRefresh}
                    label="Retry"
                    containerStyles="mt-4"
                  />
                ) : null}
              </View>
            ) : refreshing ? (
              <View className="items-center py-8">
                <ActivityIndicator size="small" color="#218225" />
              </View>
            ) : (
              <Text className="py-8 text-center font-mregular text-sm text-gray">
                You have no saved addresses yet.
              </Text>
            )
          }
          renderItem={({ item }) => {
            const isSelected = selectedAddressId === item.id;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelect(item)}
                className={`rounded-lg border p-4 active:opacity-80 ${
                  isSelected
                    ? "border-green bg-green-lighter"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="font-mbold text-lg">{item.label}</Text>
                    <Text className="mt-1 font-msbold text-sm text-[#292929]">
                      {item.recipient}
                    </Text>
                  </View>
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "location-outline"}
                    size={22}
                    color={isSelected ? "#218225" : "#8E8E8E"}
                  />
                </View>
                <Text className="mt-2 font-mregular text-sm leading-5 text-gray">
                  {item.streetAddress}
                  {item.apartment ? `, ${item.apartment}` : ""},{" "}
                  {item.deliveryArea}, {item.state} {item.zipCode}
                </Text>
                <Text className="mt-2 font-mregular text-sm text-gray">
                  {item.phone}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    </CustomButtomSheet>
  );
  },
);

SavedAddressSheet.displayName = "SavedAddressSheet";

export default SavedAddressSheet;
