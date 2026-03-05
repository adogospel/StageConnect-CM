import { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  useEffect(() => {
    const boot = async () => {
      const token = await AsyncStorage.getItem("sc_token");
      const role = await AsyncStorage.getItem("sc_role"); // on va le stocker au login

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
  }, []);

  return null;
}