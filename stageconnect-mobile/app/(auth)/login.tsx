import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { theme } from "../../constants/theme";

// ✅ VRAI LOGIN (backend)
import { login } from "../../src/services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    const e: { email?: string; password?: string } = {};
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Email invalide.";
    if (password && password.length < 6) e.password = "Minimum 6 caractères.";
    return e;
  }, [email, password]);

  const canSubmit =
    email.length > 0 && password.length > 0 && !errors.email && !errors.password;

  const onLogin = async () => {
  if (!canSubmit) {
    return Alert.alert("Vérifie tes infos", "Email valide et mot de passe (6+).");
  }
  try {
    setLoading(true);

    const data = await login(email.trim(), password);

    // ✅ redirect selon role
    if (data?.role === "company") {
      router.replace("/(company-tabs)/company-offers");
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
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Hero */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[
              "rgba(59,130,246,0.18)",
              "rgba(99,102,241,0.10)",
              "rgba(255,255,255,0)",
            ]}
            style={styles.heroGlow}
          />

          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primary2]}
                style={styles.logoInner}
              >
                <Feather name="briefcase" size={18} color="#fff" />
              </LinearGradient>
            </View>

            <View>
              <Text style={styles.brand}>StageConnect</Text>
              <Text style={styles.brandSub}>Stages & opportunités au Cameroun</Text>
            </View>
          </View>

          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>
            Trouve un stage, postule rapidement, et suis tes candidatures.
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
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

          <Pressable style={styles.forgot} onPress={() => Alert.alert("Bientôt", "Sprint futur 🙂")}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </Pressable>

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
        </View>

        {/* Footer micro-copy */}
        <Text style={styles.footer}>
          En continuant, tu acceptes les conditions et la politique de confidentialité.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ✅ Amélioration: tout descend + plus centré (meilleure respiration)
  container: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
    justifyContent: "center",
  },
  hero: {
    marginBottom: theme.spacing.lg,
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: -40,
    left: -24,
    right: -24,
    height: 220,
    borderRadius: theme.radius.xl,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    ...theme.shadow.soft,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  brandSub: {
    color: theme.colors.muted,
    fontSize: 12.5,
    fontWeight: "600",
    marginTop: 2,
  },
  title: {
    color: theme.colors.text,
    ...theme.text.h1,
    marginTop: 4,
  },
  subtitle: {
    color: theme.colors.muted,
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    maxWidth: 320,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
    ...theme.shadow.soft,
  },
  forgot: {
    alignSelf: "flex-end",
    marginTop: -6,
    marginBottom: theme.spacing.md,
  },
  forgotText: {
    color: theme.colors.primary2,
    fontSize: 13,
    fontWeight: "800",
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
  },
  footer: {
    marginTop: theme.spacing.lg,
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 8,
  },
});