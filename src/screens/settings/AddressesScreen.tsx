import {
  SettingsHeader,
  SettingsScreenRoot
} from "@/components/settings/SettingsShell";
import type { SavedAddress, SavedAddressCardProps } from "@/types/settings";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

const initialAddresses: SavedAddress[] = [
  {
    id: "address-1",
    label: "Shipping",
    address:
      "House 112, Yetu Quarters, Gbessa off Sauka, Airport Road, Abraham Adesanya, Lagos, 900105",
    isDefault: true,
  },
  {
    id: "address-2",
    label: "Shipping",
    address:
      "House 112, Yetu Quarters, Gbessa off Sauka, Airport Road, Abraham Adesanya, Lagos, 900105",
    isDefault: false,
  },
];

function SavedAddressCard({
  item,
  onEdit,
  onRemove,
  onSetDefault,
}: SavedAddressCardProps) {
  return (
    <View className="rounded-2xl bg-white p-4">
      <View className="flex-row items-center">
        <View className="size-9 items-center justify-center rounded-full bg-green-light">
          <MaterialCommunityIcons name="account" size={19} color="#218225" />
        </View>
        <Text className="ml-3 flex-1 font-mbold text-lg">{item.label}</Text>
        {item.isDefault && (
          <View className="rounded-full bg-green-light px-3 py-2">
            <Text className="font-msbold text-xs text-green">Default</Text>
          </View>
        )}
      </View>
      <Text className="mt-4 font-mregular text-base text-gray">
        {item.address}
      </Text>
      <View className="mt-5 flex-row flex-wrap gap-2">
        <Pressable
          onPress={() => onEdit(item)}
          className="h-10 flex-row items-center justify-center gap-1 rounded-lg border border-green px-2"
        >
          <MaterialCommunityIcons
            name="pencil-box-outline"
            size={17}
            color="#218225"
          />
          <Text className="font-msbold text-xs text-green">Edit</Text>
        </Pressable>
        {!item.isDefault && (
          <Pressable
            onPress={() => onSetDefault(item)}
            className="h-10 items-center justify-center rounded-lg border border-green px-2"
          >
            <Text className="font-msbold text-xs text-green">
              Set as Default
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => onRemove(item)}
          className="h-10 flex-row items-center justify-center gap-1 rounded-lg border border-red-600 px-2"
        >
          <MaterialCommunityIcons name="delete" size={15} color="#E7000B" />
          <Text className="font-msbold text-xs text-red-600">Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState(initialAddresses);
  const edit = useCallback(
    (item: SavedAddress) =>
      router.push({
        pathname: "/(protected)/(tabs)/Settings/EditAddress",
        params: { id: item.id },
      }),
    [],
  );
  const remove = useCallback(
    (item: SavedAddress) =>
      setAddresses((current) =>
        current.filter((address) => address.id !== item.id),
      ),
    [],
  );
  const setDefault = useCallback(
    (item: SavedAddress) =>
      setAddresses((current) =>
        current.map((address) => ({
          ...address,
          isDefault: address.id === item.id,
        })),
      ),
    [],
  );
  return (
    <SettingsScreenRoot>
      <SettingsHeader
        title="Delivery Addresses"
        subtitle="Manage your saved delivery locations."
      />
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SavedAddressCard
            item={item}
            onEdit={edit}
            onRemove={remove}
            onSetDefault={setDefault}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListHeaderComponent={
          <View className="mb-6 mt-3 items-end">
            <Pressable
              onPress={() =>
                router.push("/(protected)/(tabs)/Settings/AddAddress")
              }
              className="h-11 flex-row items-center justify-center gap-2 rounded-lg bg-green px-5"
            >
              <MaterialCommunityIcons name="plus" size={20} color="white" />
              <Text className="font-mbold text-base text-white">
                Add Address
              </Text>
            </Pressable>
          </View>
        }
      />
    </SettingsScreenRoot>
  );
}
