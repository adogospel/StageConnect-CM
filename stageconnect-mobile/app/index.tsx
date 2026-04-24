import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getCurrentUser, getToken } from "../src/services/auth";
import AppSplash from "../components/AppSplash";

type AppRoute =
  | "/onboarding"
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
        await new Promise((resolve) => setTimeout(resolve, 4700));

        const onboardingSeen = await AsyncStorage.getItem("sc_onboarding_seen");
        const token = await getToken();
        const user = await getCurrentUser();

        if (!onboardingSeen) {
          setRedirectTo("/onboarding");
        } else if (!token || !user?.role) {
          setRedirectTo("/(auth)/login");
        } else if (user.role === "admin") {
          setRedirectTo("/(admin-tabs)/dashboard");
        } else if (user.role === "company") {
          setRedirectTo("/(company-tabs)/publications");
        } else {
          setRedirectTo("/(student-tabs)/jobs");
        }
      } catch {
        setRedirectTo("/(auth)/login");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <AppSplash />;
  }

  return <Redirect href={redirectTo as any} />;
}