import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { ImageSource } from "expo-image";
import type { Href } from "expo-router";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import type { Animated, KeyboardTypeOptions, TextInputProps } from "react-native";

// Auth
export type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
};

export type AuthEmailRouteParams = {
  email?: string;
};

// Shared components
export type AuthOtpScreenProps = {
  title: string;
  description: string;
  email?: string;
  buttonTitle?: string;
  onConfirm: (otp: string) => void;
};

export type CountDownProps = {
  initialSeconds: number;
  onFinish?: () => void;
};

export type CustomBottomSheetProps = {
  title?: string;
  snapPoints?: Array<string | number>;
  enablePenDown?: boolean;
  onDismiss?: () => void;
  children: ReactElement;
  scrollable?: boolean;
  dynamicSizing?: boolean;
};

export type CustomBottomSheetRef = BottomSheetModal;

export type CustomButtonProps = {
  title: string;
  handlePress?: () => void;
  containerStyles?: string;
  bgColor?: string;
  textStyles?: string;
  isLoading?: boolean;
  disableButton?: boolean;
  rightElement?: ReactNode;
};

export type FormFieldProps = {
  title?: string;
  value?: string;
  placeholder?: string;
  handleChangeText?: (value: string) => void;
  labelStyle?: string;
  inputBg?: string;
  disabled?: boolean;
  otherStyles?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  required?: boolean;
  rightElement?: ReactNode;
  onPress?: () => void;
  inputContainerStyles?: string;
  isPassword?: boolean;
  optional?: boolean;
  error?: string;
  onBlur?: TextInputProps["onBlur"];
  [prop: string]: unknown;
};

export type DatePickerFieldProps = {
  title: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

export type FormFieldSheetProps = {
  title: string;
  value?: string;
  placeholder?: string;
  handleChangeText?: (value: string) => void;
  labelStyle?: string;
  inputBg?: string;
  otherStyles?: string;
  keyboardType?: KeyboardTypeOptions;
  [prop: string]: unknown;
};

export type HeaderProps = {
  title: string;
  right?: ReactElement;
  showGoBack?: boolean;
  showRight?: boolean;
  icon?: ReactNode;
  onpress?: () => void;
};

export type SpaceBetweenProps = {
  title: ReactNode;
  value: ReactNode;
  containerStyles?: string;
  titleStyles?: string;
  valueStyles?: string;
};

export type SpaceBetweenHeaderProps = {
  onBackPress: () => void;
  onRightPress?: () => void;
  rightLabel?: string;
  rightContent?: ReactNode;
  showBack?: boolean;
  showRight?: boolean;
  className?: string;
};

export type TextAreaProps = {
  title?: string;
  value: string;
  placeholder?: string;
  handleChangeText?: (value: string) => void;
  labelStyle?: string;
  otherStyles?: string;
  inputBg?: string;
  inputContainerStyles?: string;
  [prop: string]: unknown;
};

// Catalog and boxes
export type ProductCategory = string;
export type CategoryFilter = string;

export type CatalogCategoryOption = {
  id: string;
  name: string;
  value: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  weightLabel: string;
  weightInGrams: number;
  weight?: number;
  weightUnit?: "kg" | "g";
  category: ProductCategory;
  categoryId?: string;
  categorySlug?: string;
  price: string;
  priceValue?: number;
  stock: number;
  isActive?: boolean;
  image: ImageSource | string;
};

export type CatalogCategoriesProps = {
  activeCategory: CategoryFilter;
  categories?: CatalogCategoryOption[];
  onCategoryChange: (category: CategoryFilter) => void;
};

export type CatalogProductCardProps = {
  item: CatalogProduct;
  quantity: number;
  categoryBackgroundColor?: string;
  categoryTextColor?: string;
  canIncrement?: boolean;
  highlightWhenSelected?: boolean;
  onDecrement: (item: CatalogProduct) => void;
  onIncrement: (item: CatalogProduct) => void;
};

export type AddOnCategoriesProps = CatalogCategoriesProps;

export type StickyControlsProps = CatalogCategoriesProps & {
  progressPercent: number;
  remainingWeight: number;
  selectedWeight: number;
};

export type QuantityControlProps = {
  item: CatalogProduct;
  quantity: number;
  canIncrement?: boolean;
  onDecrement: (item: CatalogProduct) => void;
  onIncrement: (item: CatalogProduct) => void;
};

export type EditableProductRowProps = QuantityControlProps & {
  detail: string;
};

export type CatalogProductListItemProps = {
  item: CatalogProduct;
};

// Plans and onboarding
export type PlanType = {
  id: string;
  isFeatured?: boolean;
  name: string;
  type: string;
  description: string;
  price: string;
  weight: string;
  breakdown: string;
  image: ImageSource | string;
};

export type PlanCardProps = {
  plan: PlanType;
  onSelect: (plan: PlanType) => void;
};

export type PreBuiltItemType = {
  id: string;
  name: string;
  weight: string;
  quantity: number;
  image?: ImageSource | string;
};

export type DeliveryFrequency = {
  id: "weekly" | "bi-weekly" | "monthly";
  title: string;
  description: string;
  billing: string;
};

export type OnboardingSlide = {
  id: string;
  image: ImageSource;
  titleAccent: string;
  titleRest: string;
  description: string;
};

export type OnboardingSlideViewProps = OnboardingSlide & {
  currentIndex: number;
  skipOpacity: Animated.Value;
  onGetStarted: () => void;
  onGoToSlide: (index: number) => void;
  onSkip: () => void;
};

export type PlanListItemProps = { item: PlanType };
export type DeliveryFrequencyListItemProps = { item: DeliveryFrequency };
export type PreBuiltCardProps = { item: PreBuiltItemType };
export type AddOnsRouteParams = { boxSelections?: string };
export type ReviewCartRouteParams = AddOnsRouteParams & {
  addOnSelections?: string;
};
export type CheckoutRouteParams = ReviewCartRouteParams & {
  addOnsPrice?: string;
  total?: string;
};
export type PlansScreenProps = { variant?: "onboarding" | "tab" };

// Gift flow
export type GiftScreenProps = { variant?: "onboarding" | "tab" };

export type GiftBox = {
  id: string;
  name: string;
  description: string;
  weight: string;
  price: string;
  image: ImageSource;
  includedCuts: GiftIncludedCut[];
};

export type GiftIncludedCut = {
  id: string;
  name: string;
  quantity: string;
};

export type GiftBoxCardProps = {
  item: GiftBox;
  onSelect: (giftBox: GiftBox) => void;
};

export type GiftBoxListItemProps = { item: GiftBox };
export type GiftIncludedCutListItemProps = { item: GiftIncludedCut };

export type GiftRecipientForm = {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  occasion: string;
  deliveryDate: Date | null;
  deliveryWindow: string;
  giftNote: string;
};

export type GiftRecipientRouteParams = {
  giftId?: string;
  giftName?: string;
  weight?: string;
  price?: string;
  includedCuts?: string;
};

export type GiftCheckoutRouteParams = GiftRecipientRouteParams & {
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  occasion?: string;
  deliveryDate?: string;
  deliveryWindow?: string;
  giftNote?: string;
};

export type GiftCheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state: string;
  isDefaultAddress: boolean;
  deliveryArea: string;
  streetAddress: string;
  apartment: string;
  zipCode: string;
  deliveryNote: string;
};

// Home and referrals
export type AppIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type HomeFilterItem = { id: string; label: string };

export type HomeListHeaderProps = {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  filters: HomeFilterItem[];
  selectedFilter: string;
  searchValue: string;
  onFilterChange: (filter: string) => void;
  onSearchChange: (value: string) => void;
};

export type OverviewCardProps = {
  icon: AppIconName;
  label: string;
  value: string;
  onPress?: () => void;
};

export type GreenIconProps = { icon: AppIconName; size?: number };
export type SubscriptionDetailProps = Omit<OverviewCardProps, "onPress">;

export type HomeStats = {
  subscriptionId: string | null;
  activePlanName: string | null;
  activePlanStatus: string | null;
  frequency: number | null;
  totalOrders: number;
  nextDeliveryDate: string | null;
  memberSince: string | null;
  price: number | null;
  weight: string | null;
  weightUnit: string | null;
  nextBillingDate: string | null;
  nextCutoffAt: string | null;
  membershipStatus: string | null;
  whatsappCommunityUrl: string | null;
};

export type OrderStatus =
  | "paid"
  | "payment_failed"
  | "pending"
  | "shipped"
  | "delivered"
  | "cancelled"
  | string;

export type OrderItem = {
  id?: string | number;
  product_id?: string | number;
  name?: string;
  product_name?: string;
  image_url?: string | null;
  item_type?: string | null;
  weight?: number | string | null;
  weight_unit?: string | null;
  is_prefilled?: boolean;
  unit_price?: number;
  quantity?: number;
  price?: number;
  amount?: number;
  attributes?: Record<string, unknown>;
};

export type CustomerOrder = {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
  items: OrderItem[];
  orderType: string;
  totalAmount: number;
  deliveryFee: number;
  planId: string | null;
  giftBoxId: string | null;
  deliveryDate: string | null;
  deliveryWindowLabel: string | null;
  deliveryDistanceKm: number | string | null;
  deliveryAddressSnapshot: Record<string, unknown> | null;
  status: OrderStatus;
  user: Record<string, unknown> | null;
  plan: Record<string, unknown> | null;
  giftBoxDetails: Record<string, unknown> | null;
  giftFormDetails: Record<string, unknown> | null;
  attributes: Record<string, unknown>;
};

export type OrderMeta = {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type CustomerSubscription = {
  id: string;
  status: string;
  planName: string;
  boxWeight: string;
  frequency: number;
  price: number;
  nextBillingAt: string | null;
};

export type ReferralStat = {
  id: string;
  icon: AppIconName;
  label: string;
  value: string;
};

export type ReferralStatCardProps = { item: ReferralStat };
export type ReferralActionButtonProps = {
  icon: AppIconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export type ReferralHistoryItem = {
  id: string;
  name: string;
  initials: string;
  date: string;
  status: string;
  reward: string;
};

export type ReferralHistoryListItemProps = { item: ReferralHistoryItem };

export type RetryButtonProps = {
  onPress: () => void;
  containerStyles?: string;
  label?: string;
};

export type ReferralMeta = {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type ReferralStats = {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  rewardedReferrals: number;
  totalReferrerReward: number;
  totalReferredReward: number;
};

export type ReferralCode = {
  referralCode: string;
  stats: ReferralStats;
};

// Settings
export type SettingsIconName = AppIconName;

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

export type SupportChannel = {
  id: string;
  title: string;
  detail: string;
  note: string;
  icon: AppIconName;
  link: string;
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
  addressType: "shipping" | "billing";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  apartmentSuite: string;
  area: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
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
  isRemoving?: boolean;
  isSettingDefault?: boolean;
};

export type SettingsHeaderProps = { title: string; subtitle?: string };
export type AddressFormScreenProps = {
  mode: "add" | "edit";
  addressId?: string;
};
export type SettingsScreenRootProps = { children: ReactNode };

export type ApiAddress = {
  id: string;
  attributes?: {
    label?: string | null;
    address_type?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    street_address?: string | null;
    apartment_suite?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    country?: string | null;
    is_default?: boolean | null;
  };
};
