import {
  SettingsHeader,
  SettingsScreenRoot,
} from "@/components/settings/SettingsShell";
import type { SupportChannel } from "@/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useToast } from "react-native-toast-notifications";

const contactChannels: SupportChannel[] = [
  {
    id: "whatsapp",
    title: "WhatsApp Support",
    detail: "Click to chat with us",
    note: "Fastest response via WhatsApp.",
    icon: "whatsapp",
    link: "https://wa.me/2348089602470",
  },
  {
    id: "phone",
    title: "Call Center",
    detail: "+2348089602470",
    note: "Available Mon-Fri, 8am-6pm.",
    icon: "phone",
    link: "tel:+2348089602470",
  },
  {
    id: "email",
    title: "Email Support",
    detail: "support@meatng.com",
    note: "Best for order updates and account issues.",
    icon: "email-outline",
    link: "mailto:support@meatng.com",
  },
];

const frontendUrl =
  process.env.EXPO_PUBLIC_FRONTEND_URL ?? "https://meatng.com";

const legalDocuments = [
  {
    id: "terms",
    title: "Terms of Service",
    icon: "file-document-outline" as const,
    url: `${frontendUrl}/MeatNG_Terms_and_Conditions.pdf`,
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    icon: "shield-lock-outline" as const,
    url: `${frontendUrl}/MeatNG_Privacy_Policy.pdf`,
  },
];

const SupportScreen = () => {
  const toast = useToast();

  const openContactChannel = async (channel: SupportChannel) => {
    try {
      await Linking.openURL(channel.link);
    } catch {
      toast.show(`Unable to open ${channel.title}.`, { type: "danger" });
    }
  };

  const openLegalDocument = async (url: string, title: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      toast.show(`Unable to open ${title}.`, { type: "danger" });
    }
  };

  return (
    <SettingsScreenRoot>
      <SettingsHeader
        title="Help & Support"
        subtitle="Contact MeatNG or review our policies."
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        <Text className="mb-3 mt-3 font-mbold text-lg">Contact Us</Text>
        <View className="gap-3">
          {contactChannels.map((channel) => (
            <Pressable
              key={channel.id}
              accessibilityRole="link"
              onPress={() => void openContactChannel(channel)}
              className="flex-row items-center rounded-2xl bg-white p-4 active:opacity-70"
            >
              <View className="size-11 items-center justify-center rounded-full bg-green-light">
                <MaterialCommunityIcons
                  name={channel.icon}
                  size={21}
                  color="#218225"
                />
              </View>
              <View className="ml-3 min-w-0 flex-1">
                <Text className="font-mbold text-base">{channel.title}</Text>
                <Text className="mt-1 font-msbold text-xs text-green">
                  {channel.detail}
                </Text>
                <Text className="mt-1 font-mregular text-xs text-gray">
                  {channel.note}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#657466"
              />
            </Pressable>
          ))}
        </View>

        <Text className="mb-3 mt-6 font-mbold text-lg">Legal</Text>
        <View className="overflow-hidden rounded-2xl bg-white">
          {legalDocuments.map((document, index) => (
            <Pressable
              key={document.id}
              accessibilityRole="link"
              onPress={() =>
                void openLegalDocument(document.url, document.title)
              }
              className={`flex-row items-center px-4 py-5 active:opacity-70 ${index ? "border-t border-gray-100" : ""}`}
            >
              <View className="size-9 items-center justify-center rounded-full bg-green-light">
                <MaterialCommunityIcons
                  name={document.icon}
                  size={18}
                  color="#218225"
                />
              </View>
              <Text className="ml-3 flex-1 font-mmedium text-base">
                {document.title}
              </Text>
              <MaterialCommunityIcons
                name="open-in-new"
                size={19}
                color="#657466"
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SettingsScreenRoot>
  );
};

export default SupportScreen;
