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

  const [redirectTo, setRedirectTo] = useState<AppRoute>(
    "/(auth)/login"
  );

  useEffect(() => {
    const initializeApp = async () => {
      try {
        /*
         * On garde ton splash personnalisé actuel.
         * Cette durée sera optimisée plus tard pendant
         * le travail sur l'expérience de démarrage.
         */
        await new Promise((resolve) =>
          setTimeout(resolve, 4700)
        );

        /*
         * IMPORTANT :
         * On ne supprime PLUS sc_token et sc_user ici.
         * La session de l'utilisateur doit persister
         * après la fermeture de l'application.
         */

        const onboardingSeen =
          await AsyncStorage.getItem(
            "sc_onboarding_seen"
          );

        const token = await getToken();
        const user = await getCurrentUser();

        /*
         * 1. Première ouverture de l'application
         */
        if (!onboardingSeen) {
          setRedirectTo("/onboarding");
          return;
        }

        /*
         * 2. Aucun utilisateur connecté
         */
        if (!token || !user?.role) {
          setRedirectTo("/(auth)/login");
          return;
        }

        /*
         * 3. Administrateur
         */
        if (user.role === "admin") {
          setRedirectTo(
            "/(admin-tabs)/dashboard"
          );
          return;
        }

        /*
         * 4. Entreprise
         */
        if (user.role === "company") {
          setRedirectTo(
            "/(company-tabs)/publications"
          );
          return;
        }

        /*
         * 5. Candidat
         */
        setRedirectTo(
          "/(student-tabs)/jobs"
        );
      } catch (error) {
        console.error(
          "APP INITIALIZATION ERROR:",
          error
        );

        setRedirectTo("/(auth)/login");
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading) {
    return <AppSplash />;
  }

  return (
    <Redirect href={redirectTo as any} />
  );
}