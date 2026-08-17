import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import {
  SAVED_ADDRESS_PLACEHOLDER,
  type SavedAddress,
} from "./SavedAddressSheet";

type SavedAddressFieldProps = {
  addresses: SavedAddress[];
  selectedAddressId?: string;
  onPress: () => void;
};

const SavedAddressField = ({
  addresses,
  selectedAddressId,
  onPress,
}: SavedAddressFieldProps) => {
  const selectedAddress = addresses.find(
    (address) => address.id === selectedAddressId,
  );
  const value = selectedAddress
    ? `${selectedAddress.label} - ${selectedAddress.streetAddress}`
    : "";
  const placeholder = addresses.length
    ? SAVED_ADDRESS_PLACEHOLDER
    : "Enter address manually";

  return (
    <View>
      <Text className="pb-2 font-mmedium text-base text-blue">
        Use a saved address
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Use a saved address. ${value || placeholder}`}
        onPress={onPress}
        className="h-14 w-full flex-row items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 active:border-green active:opacity-80"
      >
        <Text
          numberOfLines={1}
          className={`flex-1 font-mregular text-base ${
            value ? "text-black" : "text-[#A3A3A3]"
          }`}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={22} color="#8E8E8E" />
      </Pressable>
    </View>
  );
};

export default SavedAddressField;
