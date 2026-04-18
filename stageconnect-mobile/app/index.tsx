import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { getCurrentUser, getToken } from "../src/services/auth";

type AppRoute =
  | "/(auth)/login"
  | "/(student-tabs)/jobs"
  | "/(company-tabs)/publications"
  | "/(admin-tabs)/dashboard";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState<AppRoute>("/(auth)/login");

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const user = await getCurrentUser();

        if (!token || !user?.role) {
          setRedirectTo("/(auth)/login");
        } else if (user.role === "admin") {
          setRedirectTo("/(admin-tabs)/dashboard");
        } else if (user.role === "company") {
          setRedirectTo("/(company-tabs)/publications");
        } else {
          setRedirectTo("/(student-tabs)/jobs");
        }
      } catch (error) {
        setRedirectTo("/(auth)/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F6F8FC",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={redirectTo} />;
}