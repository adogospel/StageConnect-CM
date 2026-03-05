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

// ✅ Backend
import AsyncStorage from "@react-native-async-storage/async-storage";
import { register as registerApi } from "../../src/services/auth";

type Role = "student" | "company";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || parts[0] || "";
  return { firstName, lastName };
}

export default function Register() {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  // Step 2
  const [role, setRole] = useState<Role>("student");
  const [city, setCity] = useState("");

  // ✅ Champs requis pour StudentProfile
  const [university, setUniversity] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [level, setLevel] = useState("");

  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    const e: {
      fullName?: string;
      email?: string;
      password?: string;
      city?: string;
      university?: string;
      fieldOfStudy?: string;
      level?: string;
    } = {};

    if (fullName && fullName.trim().length < 2) e.fullName = "Nom trop court.";
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Email invalide.";
    if (password && password.length < 6) e.password = "Minimum 6 caractères.";

    // On force city si student (car required dans StudentProfile)
    if (role === "student" && city.trim().length === 0) e.city = "Ville requise.";

    if (role === "student") {
      if (!university.trim()) e.university = "Université requise.";
      if (!fieldOfStudy.trim()) e.fieldOfStudy = "Filière requise.";
      if (!level.trim()) e.level = "Niveau requis.";
    }

    return e;
  }, [fullName, email, password, role, city, university, fieldOfStudy, level]);

  const canNext =
    fullName.trim().length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    !errors.fullName &&
    !errors.email &&
    !errors.password;

  const canSubmit =
    role === "company"
      ? true
      : role === "student" &&
        !errors.city &&
        !errors.university &&
        !errors.fieldOfStudy &&
        !errors.level;

  const goNext = () => {
    if (!canNext) {
      return Alert.alert("Vérifie tes infos", "Nom, email valide, mot de passe (6+).");
    }
    setStep(2);
  };

  const goBack = () => setStep(1);

  const onRegister = async () => {
    if (!canSubmit) {
      return Alert.alert("Infos manquantes", "Complète les champs requis.");
    }

    try {
      setLoading(true);

      const { firstName, lastName } = splitName(fullName);

      const payload: any = {
        email: email.trim().toLowerCase(),
        password,
        role,
      };

      // Backend exige StudentProfile complet pour student
      if (role === "student") {
        payload.firstName = firstName;
        payload.lastName = lastName;
        payload.city = city.trim();
        payload.university = university.trim();
        payload.fieldOfStudy = fieldOfStudy.trim();
        payload.level = level.trim();
        payload.skills = []; // optionnel
      } else {
        // company (pour l’instant, backend crée seulement User)
        // tu peux envoyer city si tu veux (ça n’explose pas)
        payload.city = city.trim();
      }

      const data = await registerApi(payload);

      // ✅ si backend renvoie token (c'est ton cas)
      const token = data?.token || data?.accessToken;
      if (token) {
        await AsyncStorage.setItem("sc_token", token);
      }

      Alert.alert("Compte créé ✅", "Bienvenue sur StageConnect !");
      router.replace("/(tabs)/jobs");
    } catch (e: any) {
      Alert.alert(
        "Inscription échouée",
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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.hero}>
          <LinearGradient
            colors={["rgba(59,130,246,0.16)", "rgba(99,102,241,0.10)", "rgba(255,255,255,0)"]}
            style={styles.heroGlow}
          />

          <View style={styles.topRow}>
            <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
              <Feather name="chevron-left" size={20} color={theme.colors.text} />
            </Pressable>

            <View style={styles.stepPills}>
              <View style={[styles.pill, step === 1 ? styles.pillActive : null]} />
              <View style={[styles.pill, step === 2 ? styles.pillActive : null]} />
            </View>

            <View style={{ width: 40 }} />
          </View>

          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "Commence par les informations de base."
              : "Choisis ton profil pour personnaliser l’expérience."}
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {step === 1 ? (
            <>
              <Input
                label="Nom complet"
                icon="user"
                value={fullName}
                onChangeText={setFullName}
                placeholder="ex: Adonai N."
                error={errors.fullName}
              />

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

              <Button title="Continuer" onPress={goNext} disabled={!canNext} />
              <Pressable onPress={() => router.replace("/(auth)/login")} style={{ marginTop: 14 }}>
                <Text style={styles.link}>
                  Tu as déjà un compte ? <Text style={styles.linkStrong}>Se connecter</Text>
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Je suis :</Text>

              <View style={styles.roleGrid}>
                <RoleCard
                  active={role === "student"}
                  title="Étudiant"
                  subtitle="Trouver un stage & postuler"
                  icon="award"
                  onPress={() => setRole("student")}
                />
                <RoleCard
                  active={role === "company"}
                  title="Entreprise"
                  subtitle="Publier des offres & recruter"
                  icon="briefcase"
                  onPress={() => setRole("company")}
                />
              </View>

              <Input
                label={role === "student" ? "Ville" : "Ville (optionnel)"}
                icon="map-pin"
                value={city}
                onChangeText={setCity}
                placeholder="ex: Yaoundé"
                error={role === "student" ? errors.city : undefined}
              />

              {/* ✅ Champs requis seulement si Student */}
              {role === "student" && (
                <>
                  <Input
                    label="Université"
                    icon="book"
                    value={university}
                    onChangeText={setUniversity}
                    placeholder="ex: IUT / Université de Yaoundé"
                    error={errors.university}
                  />

                  <Input
                    label="Filière"
                    icon="layers"
                    value={fieldOfStudy}
                    onChangeText={setFieldOfStudy}
                    placeholder="ex: Génie Logiciel"
                    error={errors.fieldOfStudy}
                  />

                  <Input
                    label="Niveau"
                    icon="bar-chart-2"
                    value={level}
                    onChangeText={setLevel}
                    placeholder="ex: L2 / BTS / Licence / Master"
                    error={errors.level}
                  />
                </>
              )}

              <View style={{ flexDirection: "row", gap: 12 }}>
                <Button title="Retour" onPress={goBack} variant="ghost" style={{ flex: 1 }} />
                <Button
                  title={loading ? "Création..." : "Créer mon compte"}
                  onPress={onRegister}
                  loading={loading}
                  disabled={!canSubmit}
                  style={{ flex: 1 }}
                />
              </View>

              <Text style={styles.micro}>
                {role === "student"
                  ? "Ces infos sont nécessaires pour postuler."
                  : "Tu pourras compléter ton profil entreprise plus tard."}
              </Text>
            </>
          )}
        </View>

        <Text style={styles.footer}>
          En créant un compte, tu acceptes les conditions et la politique de confidentialité.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RoleCard({
  active,
  title,
  subtitle,
  icon,
  onPress,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.roleCard, active ? styles.roleActive : null]}>
      <View style={[styles.roleIcon, active ? styles.roleIconActive : null]}>
        <Feather name={icon} size={18} color={active ? "#fff" : theme.colors.text} />
      </View>
      <Text style={styles.roleTitle}>{title}</Text>
      <Text style={styles.roleSub}>{subtitle}</Text>
      {active && (
        <View style={styles.check}>
          <Feather name="check" size={14} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.soft,
  },
  stepPills: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  pill: {
    width: 28,
    height: 6,
    borderRadius: 99,
    backgroundColor: "rgba(15,23,42,0.12)",
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
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
    maxWidth: 330,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
    ...theme.shadow.soft,
  },
  link: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  linkStrong: {
    color: theme.colors.primary2,
    fontWeight: "900",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 12,
  },
  roleGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: theme.spacing.lg,
  },
  roleCard: {
    flex: 1,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: theme.radius.xl,
    padding: 14,
    position: "relative",
  },
  roleActive: {
    backgroundColor: "rgba(59,130,246,0.10)",
    borderColor: "rgba(59,130,246,0.35)",
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  roleIconActive: {
    backgroundColor: theme.colors.primary,
    borderColor: "transparent",
  },
  roleTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  roleSub: {
    color: theme.colors.muted,
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: 6,
    lineHeight: 17,
  },
  check: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  micro: {
    marginTop: 14,
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
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