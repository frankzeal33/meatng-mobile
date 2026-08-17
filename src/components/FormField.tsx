import type { FormFieldProps } from "@/types";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

const FormField = ({
  title,
  value,
  placeholder,
  inputBg,
  keyboardType,
  handleChangeText,
  disabled,
  maxLength,
  labelStyle,
  otherStyles,
  required,
  rightElement,
  onPress,
  inputContainerStyles,
  isPassword,
  optional,
  error,
  onBlur,
  ...props
}: FormFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordField =
    isPassword ||
    title === "Password*" ||
    title === "Confirm Password*" ||
    title === "Current Password*" ||
    title === "New Password*" ||
    title === "Confirm New Password*";

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      {title ? (
        <Text
          className={`pb-2 font-mmedium text-base ${labelStyle ? labelStyle : "text-blue"}`}
        >
          {title}
          {required && <Text className="text-red-600"> *</Text>}
          {optional && (
            <Text className="font-mregular text-gray"> (optional)</Text>
          )}
        </Text>
      ) : null}
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        className={`${inputBg ?? "bg-white"} border ${error ? "border-red-600" : isFocused ? "border-green" : "border-gray-300"} h-14 w-full flex-row items-center gap-1 rounded-lg px-4 ${inputContainerStyles ?? ""}`}
      >
        <TextInput
          className={`${inputBg ?? "bg-white"} h-full flex-1 font-mregular text-base text-black`}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#A3A3A3"
          onChangeText={handleChangeText}
          secureTextEntry={passwordField ? !showPassword : false}
          keyboardType={keyboardType ? keyboardType : "default"}
          editable={!disabled && !onPress}
          maxLength={maxLength}
          pointerEvents={onPress ? "none" : "auto"}
          onFocus={() => setIsFocused(true)}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          accessibilityState={{ disabled: disabled || false }}
          accessibilityHint={error}
          {...props}
        />
        {rightElement}
        {passwordField && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={!showPassword ? "eye-outline" : "eye-off-outline"}
              size={24}
              color="#929292"
            />
          </TouchableOpacity>
        )}
      </Pressable>
      {error ? (
        <View className="mt-1 flex-row items-start gap-1.5">
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color="#DC2626"
            style={{ marginTop: 1 }}
          />
          <Text
            className="flex-1 font-mregular text-sm text-red-600"
            accessibilityRole="alert"
          >
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default FormField;
