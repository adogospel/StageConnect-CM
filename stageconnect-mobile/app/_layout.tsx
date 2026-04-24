import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    const hide = async () => {
      await SplashScreen.hideAsync();
    };

    hide();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(student-tabs)" />
      <Stack.Screen name="(company-tabs)" />
      <Stack.Screen name="(admin-tabs)" />
      <Stack.Screen name="student" />
      <Stack.Screen name="company" />
    </Stack>
  );
}