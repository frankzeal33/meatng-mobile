import AddressFormScreen from "@/screens/settings/AddressFormScreen";
import { useLocalSearchParams } from "expo-router";

export default function EditAddressScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <AddressFormScreen mode="edit" addressId={id} />;
}
