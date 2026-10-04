import { Fredoka_500Medium } from '@expo-google-fonts/fredoka/500Medium';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka/700Bold';
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_600SemiBold_Italic } from '@expo-google-fonts/nunito/600SemiBold_Italic';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Float } from '@/components/ui/Float';
import { useSocial } from '@/state/store';
import { colors } from '@/theme';

const overlay = {
  presentation: 'transparentModal',
  animation: 'fade',
  contentStyle: { backgroundColor: 'transparent' },
} as const;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_600SemiBold_Italic,
    Nunito_800ExtraBold,
  });
  const init = useSocial((s) => s.init);

  useEffect(() => {
    void init();
  }, [init]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.cream }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {fontsLoaded ? (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="create" options={overlay} />
            <Stack.Screen name="availability" options={overlay} />
            <Stack.Screen name="person/[id]" options={overlay} />
          </Stack>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Float amplitude={6}>
              <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: colors.coral }} />
            </Float>
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
