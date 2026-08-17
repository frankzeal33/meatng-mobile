import type { DatePickerFieldProps } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import DatePicker from "react-native-date-picker";

const DatePickerField = ({
  title,
  value,
  onChange,
  placeholder = "Select date",
  required,
  optional,
  error,
  minimumDate,
  maximumDate
}: DatePickerFieldProps) => {
  const [open, setOpen] = useState(false);
  const pickerDate = value ?? minimumDate ?? new Date();

  return (
    <View>
      <Text className="pb-2 font-mmedium text-base text-blue">
        {title}
        {required ? <Text className="text-red-600"> *</Text> : null}
        {optional ? (
          <Text className="font-mregular text-gray"> (optional)</Text>
        ) : null}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(true)}
        className={`h-14 w-full flex-row items-center rounded-lg border bg-white px-4 ${
          error ? "border-red-600" : "border-gray-300"
        }`}
      >
        <Text
          numberOfLines={1}
          className={`flex-1 font-mregular text-base ${
            value ? "text-black" : "text-[#A3A3A3]"
          }`}
        >
          {value ? format(value, "do MMM yyyy") : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={21} color="#218225" />
      </TouchableOpacity>

      {error ? (
        <View className="mt-1 flex-row items-start gap-1.5">
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color="#DC2626"
            style={{ marginTop: 1 }}
          />
          <Text
            accessibilityRole="alert"
            className="flex-1 font-mregular text-sm text-red-600"
          >
            {error}
          </Text>
        </View>
      ) : null}

      <DatePicker
        modal
        open={open}
        mode="date"
        date={pickerDate}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        theme="light"
        buttonColor="#218225"
        title={title}
        onConfirm={(date) => {
          setOpen(false);
          onChange(date);
        }}
        onCancel={() => setOpen(false)}
      />
    </View>
  );
};

export default DatePickerField;
