import { Platform, View } from "react-native";
import LottieView from 'lottie-react-native';
import { images } from "@/constants";

const FullScreenLoader = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
      <View style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
      }}>
        <View className="bg-white rounded-lg w-24 h-20 items-center justify-center"
          style={{
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
              },
              android: {
                elevation: 3,
              },
            }),
          }}
        >
          <LottieView
            source={images.loading}
            autoPlay
            speed={3}
            loop
            style={{ width: 60, height: 60, marginHorizontal: "auto" }}
          />
        </View>
      </View>
  );
};

export default FullScreenLoader
