import type { ComponentProps } from "react";
import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { Href } from "expo-router";
import type { ReactNode } from "react";

export type SettingsIconName = ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

export type SettingsMenuItem = {
  id: string;
  title: string;
  icon: SettingsIconName;
  route?: Href;
  destructive?: boolean;
};

export type SettingsMenuRowProps = {
  item: SettingsMenuItem;
  onPress: (item: SettingsMenuItem) => void;
};

export type PersonalInformationForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type AddressForm = {
  label: string;
  firstName: string;
  lastName: string;
  email: string;
  addressType: "Shipping" | "Billing";
  streetAddress: string;
  area: string;
  state: string;
  country: string;
  zipCode: string;
};

export type SavedAddress = {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
};

export type SavedAddressCardProps = {
  item: SavedAddress;
  onEdit: (item: SavedAddress) => void;
  onRemove: (item: SavedAddress) => void;
  onSetDefault: (item: SavedAddress) => void;
};

export type SettingsHeaderProps = {
  title: string;
  subtitle?: string;
};

export type AddressFormScreenProps = {
  mode: "add" | "edit";
};

export type SettingsScreenRootProps = {
  children: ReactNode;
};
