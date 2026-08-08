import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import type { ReactElement, ReactNode } from "react";
import type { KeyboardTypeOptions } from "react-native";

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
  [prop: string]: unknown;
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
