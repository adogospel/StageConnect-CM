import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Easing,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { theme } from "../../constants/theme";
import { login } from "../../src/services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(22)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: -10,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 8,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, translateAnim, floatAnim1, floatAnim2, pulseAnim]);

  const errors = useMemo(() => {
    const e: { email?: string; password?: string } = {};
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Email invalide.";
    if (password && password.length < 6) e.password = "Minimum 6 caractères.";
    return e;
  }, [email, password]);

  const canSubmit =
    email.length > 0 &&
    password.length > 0 &&
    !errors.email &&
    !errors.password;

  const onLogin = async () => {
    if (!canSubmit) {
      return Alert.alert(
        "Vérifie tes infos",
        "Entre un email valide et un mot de passe d’au moins 6 caractères."
      );
    }

    try {
      setLoading(true);

      const data = await login(email.trim(), password);

      if (data.role === "admin") {
        router.replace("/(admin-tabs)/dashboard");
      } else if (data.role === "company") {
        router.replace("/(company-tabs)/home");
      } else {
        router.replace("/(student-tabs)/jobs");
      }
    } catch (e: any) {
      Alert.alert(
        "Connexion échouée",
        e?.response?.data?.message || e?.message || "Réessaie."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.floatingOrbOne,
              { transform: [{ translateY: floatAnim1 }] },
            ]}
          />
          <Animated.View
            style={[
              styles.floatingOrbTwo,
              { transform: [{ translateY: floatAnim2 }] },
            ]}
          />

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
            }}
          >
            <View style={styles.hero}>
              <LinearGradient
                colors={[
                  "rgba(59,130,246,0.20)",
                  "rgba(99,102,241,0.10)",
                  "rgba(255,255,255,0)",
                ]}
                style={styles.heroGlow}
              />

              <View style={styles.brandRow}>
                <Animated.View
                  style={[
                    styles.logoWrap,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primary2]}
                    style={styles.logoInner}
                  >
                    <Feather name="briefcase" size={20} color="#fff" />
                  </LinearGradient>
                </Animated.View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.brand}>StageConnect</Text>
                  <Text style={styles.brandSub}>
                    Offres d’emploi • stages • recrutement moderne
                  </Text>
                </View>
              </View>

              <Text style={styles.title}>Heureux de te revoir</Text>
              <Text style={styles.subtitle}>
                Connecte-toi pour retrouver ton espace, suivre tes candidatures
                ou gérer tes opportunités de recrutement.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Connexion</Text>
                <Text style={styles.cardSubTitle}>
                  Entre tes identifiants pour continuer.
                </Text>
              </View>

              <Input
                label="Email"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="ex: adonai@gmail.com"
                error={errors.email}
              />

              <Input
                label="Mot de passe"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secure}
                placeholder="••••••••"
                error={errors.password}
                right={
                  <Pressable onPress={() => setSecure((s) => !s)} hitSlop={10}>
                    <Feather
                      name={secure ? "eye" : "eye-off"}
                      size={18}
                      color={theme.colors.faint}
                    />
                  </Pressable>
                }
              />

              <Button
                title={loading ? "Connexion..." : "Se connecter"}
                onPress={onLogin}
                loading={loading}
                disabled={!canSubmit}
                style={{ marginTop: 4 }}
              />

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.divider} />
              </View>

              <Button
                title="Créer un compte"
                onPress={() => router.push("/(auth)/register")}
                variant="ghost"
              />

              <View style={styles.bottomInfo}>
                <Feather name="check-circle" size={14} color="#16A34A" />
                <Text style={styles.bottomInfoText}>
                  Une seule app pour candidater, recruter et suivre tout au même endroit.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },
  floatingOrbOne: {
    position: "absolute",
    top: 56,
    right: 18,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.10)",
  },
  floatingOrbTwo: {
    position: "absolute",
    top: 180,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 999,
    backgroundColor: "rgba(99,102,241,0.08)",
  },
  hero: {
    marginBottom: 20,
    position: "relative",
    paddingTop: 6,
  },
  heroGlow: {
    position: "absolute",
    top: -30,
    left: -18,
    right: -18,
    height: 250,
    borderRadius: 34,
  },
  topBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.10)",
    marginBottom: 18,
  },
  topBadgeText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.soft,
  },
  logoInner: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  brandSub: {
    color: theme.colors.muted,
    fontSize: 12.5,
    fontWeight: "600",
    marginTop: 3,
    lineHeight: 18,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 36,
  },
  subtitle: {
    color: theme.colors.muted,
    marginTop: 10,
    fontSize: 14.5,
    fontWeight: "600",
    lineHeight: 22,
    maxWidth: 340,
  },
  quickInfoRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    flexWrap: "wrap",
  },
  quickInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  quickInfoText: {
    color: theme.colors.text,
    fontSize: 12.5,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: 20,
    ...theme.shadow.soft,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: "900",
  },
  cardSubTitle: {
    color: theme.colors.muted,
    marginTop: 5,
    fontSize: 13.5,
    fontWeight: "600",
    lineHeight: 20,
  },
  helperRow: {
    marginBottom: 10,
    marginTop: 2,
  },
  helperChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(59,130,246,0.08)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  helperChipText: {
    color: theme.colors.primary,
    fontSize: 12.5,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: theme.spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.stroke,
  },
  dividerText: {
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  bottomInfo: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.stroke,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  bottomInfoText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 12.5,
    fontWeight: "600",
    lineHeight: 18,
  },
});