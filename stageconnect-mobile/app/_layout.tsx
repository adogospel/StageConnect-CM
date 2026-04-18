import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(student-tabs)" />
      <Stack.Screen name="(company-tabs)" />
      <Stack.Screen name="(admin-tabs)" />
      <Stack.Screen name="student" />
      <Stack.Screen name="company" />
    </Stack>
  );
}