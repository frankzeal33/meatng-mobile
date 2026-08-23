import { View, Text, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'

export default function goto() {
  return (
    <View className='flex-1 bg-white items-center justify-center'>
        <ActivityIndicator size="large" color="#218225"/>
        <Text className="text-base mt-2 font-msbold">Please wait</Text>
        <StatusBar style='dark'/>
    </View>
  )
}