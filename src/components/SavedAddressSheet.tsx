import type { CustomBottomSheetRef } from "@/types/components";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import CustomButtomSheet from "./CustomButtomSheet";

export type SavedAddress = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  streetAddress: string;
  apartment: string;
  deliveryArea: string;
  state: string;
  zipCode: string;
};

type SavedAddressSheetProps = {
  selectedAddressId?: string;
  onSelect: (address: SavedAddress) => void;
};

export const SAVED_ADDRESS_PLACEHOLDER = "Select a saved address";

const DUMMY_ADDRESSES: SavedAddress[] = [
  {
    id: "home",
    label: "Home",
    recipient: "Adebola Okonkwo",
    phone: "08123456789",
    streetAddress: "12 Adeniyi Jones Avenue",
    apartment: "First Floor",
    deliveryArea: "Ikeja",
    state: "Lagos",
    zipCode: "100271",
  },
  {
    id: "office",
    label: "Office",
    recipient: "Adebola Okonkwo",
    phone: "08123456789",
    streetAddress: "18 Admiralty Way",
    apartment: "Suite 4B",
    deliveryArea: "Lekki",
    state: "Lagos",
    zipCode: "106104",
  },
  {
    id: "family",
    label: "Family House",
    recipient: "Chidi Okonkwo",
    phone: "08034567890",
    streetAddress: "7 Unity Crescent",
    apartment: "",
    deliveryArea: "Victoria Island",
    state: "Lagos",
    zipCode: "101241",
  },
];

const SavedAddressSheet = forwardRef<
  CustomBottomSheetRef,
  SavedAddressSheetProps
>(({ selectedAddressId, onSelect }, ref) => {
  const snapPoints = useMemo(() => ["90%"], []);

  return (
    <CustomButtomSheet
      ref={ref}
      snapPoints={snapPoints}
      dynamicSizing={false}
      scrollable
    >
      <View className="h-full">
        <Text className="mb-1 font-mbold text-2xl">Saved addresses</Text>
        <Text className="mb-4 font-mregular text-sm text-gray">
          Choose an address for this delivery.
        </Text>
        <BottomSheetFlatList
          data={DUMMY_ADDRESSES}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
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
});

SavedAddressSheet.displayName = "SavedAddressSheet";

export default SavedAddressSheet;
