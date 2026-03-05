import { useEffect } from "react";
import { router, useRootNavigationState } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const navState = useRootNavigationState();

  useEffect(() => {
    if (!navState?.key) return; // ✅ attend que la nav soit prête

    const boot = async () => {
      const token = await AsyncStorage.getItem("sc_token");
      const role = await AsyncStorage.getItem("sc_role");

      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      if (role === "company") {
        router.replace("/(company-tabs)/company-offers");
      } else {
        router.replace("/(student-tabs)/jobs");
      }
    };

    boot();
  }, [navState?.key]);

  return null;
}