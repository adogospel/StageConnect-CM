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
import { register } from "../../src/services/auth";

type Role = "student" | "company";
type CandidateType = "student" | "worker";

export default function Register() {
  const [step, setStep] = useState<1 | 2>(1);

  // step 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);

  // step 2
  const [role, setRole] = useState<Role>("student");
  const [candidateType, setCandidateType] = useState<CandidateType>("student");
  const [city, setCity] = useState("");

  // student fields
  const [university, setUniversity] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [level, setLevel] = useState("");

  // worker fields
  const [activitySector, setActivitySector] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [highestEducation, setHighestEducation] = useState("");

  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    const e: { fullName?: string; email?: string; password?: string } = {};
    if (fullName && fullName.trim().length < 2) e.fullName = "Nom trop court.";
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Email invalide.";
    if (password && password.length < 6) e.password = "Minimum 6 caractères.";
    return e;
  }, [fullName, email, password]);

  const canNext =
    fullName.trim().length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    !errors.fullName &&
    !errors.email &&
    !errors.password;

  const validateStep2 = () => {
    if (!city.trim()) {
      Alert.alert("Champ requis", "La ville est requise.");
      return false;
    }

    if (role === "student" && candidateType === "student") {
      if (!university.trim() || !fieldOfStudy.trim() || !level.trim()) {
        Alert.alert(
          "Champs requis",
          "Université, filière et niveau d’étude sont requis."
        );
        return false;
      }
    }

    if (role === "student" && candidateType === "worker") {
      if (!activitySector.trim() || !yearsOfExperience.trim() || !highestEducation.trim()) {
        Alert.alert(
          "Champs requis",
          "Secteur, années d’expérience et dernier diplôme sont requis."
        );
        return false;
      }
    }

    return true;
  };

  const onRegister = async () => {
    if (!validateStep2()) return;

    try {
      setLoading(true);

      const payload: any = {
        email: email.trim(),
        password,
        role,
        fullName: fullName.trim(),
        city: city.trim(),
      };

      if (role === "student") {
        payload.candidateType = candidateType;

        if (candidateType === "student") {
          payload.university = university.trim();
          payload.fieldOfStudy = fieldOfStudy.trim();
          payload.level = level.trim();
        }

        if (candidateType === "worker") {
          payload.activitySector = activitySector.trim();
          payload.yearsOfExperience = Number(yearsOfExperience);
          payload.highestEducation = highestEducation.trim();
        }
      }

      const data = await register(payload);

      if (data.role === "company") {
        router.replace("/(company-tabs)/home");
      } else {
        router.replace("/(student-tabs)/jobs");
      }
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
        <View style={styles.hero}>
          <LinearGradient
            colors={["rgba(59,130,246,0.16)", "rgba(99,102,241,0.10)", "rgba(255,255,255,0)"]}
            style={styles.heroGlow}
          />

          <View style={styles.topRow}>
            <Pressable
              onPress={() => (step === 1 ? router.back() : setStep(1))}
              hitSlop={10}
              style={styles.backBtn}
            >
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
              ? "Commence par tes informations de compte."
              : "Complète ton profil pour une expérience personnalisée."}
          </Text>
        </View>

        <View style={styles.card}>
          {step === 1 ? (
            <>
              <Input
                label="Nom complet"
                icon="user"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ex: Adonai N."
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

              <Button
                title="Continuer"
                onPress={() => {
                  if (!canNext) {
                    return Alert.alert(
                      "Vérifie tes infos",
                      "Nom, email valide, mot de passe (6+)."
                    );
                  }
                  setStep(2);
                }}
              />
            </>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Type de compte</Text>

              <View style={styles.choiceRow}>
                <Pressable
                  style={[styles.choiceCard, role === "student" && styles.choiceCardActive]}
                  onPress={() => setRole("student")}
                >
                  <Text style={styles.choiceTitle}>Candidat</Text>
                  <Text style={styles.choiceSub}>Je cherche un emploi ou un stage</Text>
                </Pressable>

                <Pressable
                  style={[styles.choiceCard, role === "company" && styles.choiceCardActive]}
                  onPress={() => setRole("company")}
                >
                  <Text style={styles.choiceTitle}>Entreprise</Text>
                  <Text style={styles.choiceSub}>Je publie des offres</Text>
                </Pressable>
              </View>

              <Input
                label="Ville"
                icon="map-pin"
                value={city}
                onChangeText={setCity}
                placeholder="Yaoundé"
              />

              {role === "student" ? (
                <>
                  <Text style={styles.sectionLabel}>Je suis</Text>

                  <View style={styles.choiceRow}>
                    <Pressable
                      style={[
                        styles.choiceCard,
                        candidateType === "student" && styles.choiceCardActive,
                      ]}
                      onPress={() => setCandidateType("student")}
                    >
                      <Text style={styles.choiceTitle}>Étudiant</Text>
                      <Text style={styles.choiceSub}>Université / école</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.choiceCard,
                        candidateType === "worker" && styles.choiceCardActive,
                      ]}
                      onPress={() => setCandidateType("worker")}
                    >
                      <Text style={styles.choiceTitle}>Travailleur</Text>
                      <Text style={styles.choiceSub}>Déjà actif professionnellement</Text>
                    </Pressable>
                  </View>

                  {candidateType === "student" ? (
                    <>
                      <Input
                        label="Université / École"
                        icon="book-open"
                        value={university}
                        onChangeText={setUniversity}
                        placeholder="Ex: Université de Yaoundé I"
                      />
                      <Input
                        label="Filière"
                        icon="layers"
                        value={fieldOfStudy}
                        onChangeText={setFieldOfStudy}
                        placeholder="Ex: Génie Logiciel"
                      />
                      <Input
                        label="Niveau d’étude"
                        icon="award"
                        value={level}
                        onChangeText={setLevel}
                        placeholder="Ex: Licence 3"
                      />
                    </>
                  ) : (
                    <>
                      <Input
                        label="Secteur d’activité"
                        icon="briefcase"
                        value={activitySector}
                        onChangeText={setActivitySector}
                        placeholder="Ex: Développement web"
                      />
                      <Input
                        label="Années d’expérience"
                        icon="clock"
                        value={yearsOfExperience}
                        onChangeText={setYearsOfExperience}
                        keyboardType="numeric"
                        placeholder="Ex: 2"
                      />
                      <Input
                        label="Dernier diplôme"
                        icon="award"
                        value={highestEducation}
                        onChangeText={setHighestEducation}
                        placeholder="Ex: Licence"
                      />
                    </>
                  )}
                </>
              ) : null}

              <Button
                title={loading ? "Création..." : "Créer mon compte"}
                onPress={onRegister}
                loading={loading}
              />
            </>
          )}
        </View>

        <Text style={styles.footer}>
          En continuant, tu acceptes les conditions et la politique de confidentialité.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
    borderRadius: 16,
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
  },
  pill: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.stroke,
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
  sectionLabel: {
    color: theme.colors.faint,
    fontSize: 12.5,
    fontWeight: "900",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  choiceRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  choiceCard: {
    flex: 1,
    backgroundColor: theme.colors.surface2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: 14,
  },
  choiceCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "rgba(59,130,246,0.08)",
  },
  choiceTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },
  choiceSub: {
    color: theme.colors.muted,
    fontSize: 12.5,
    fontWeight: "700",
    lineHeight: 17,
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