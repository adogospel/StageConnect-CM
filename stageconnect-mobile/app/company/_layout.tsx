import { Stack } from "expo-router";

export default function CompanyStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="create-job"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />

      <Stack.Screen
        name="edit-profile"
        options={{
          presentation: "modal",
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen
        name="candidates/[jobId]"
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}