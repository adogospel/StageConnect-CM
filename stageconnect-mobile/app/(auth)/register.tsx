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
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { theme } from "../../constants/theme";
import { register } from "../../src/services/auth";
import { createSkill, searchSkills } from "../../src/services/skills";
import { SafeAreaView } from "react-native-safe-area-context";

type Role = "student" | "company";
type CandidateType = "student" | "worker";

function normalizeSkill(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

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
  const [phone, setPhone] = useState("");

  // worker fields
  const [activitySector, setActivitySector] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [highestEducation, setHighestEducation] = useState("");

  // skills
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSuggestions, setSkillSuggestions] = useState<
    { _id: string; name: string }[]
  >([]);
  const [skillLoading, setSkillLoading] = useState(false);
  const [creatingSkill, setCreatingSkill] = useState(false);

  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    const e: {
      fullName?: string;
      email?: string;
      password?: string;
      phone?: string;
      skills?: string;
    } = {};

    if (fullName && fullName.trim().length < 2) e.fullName = "Nom trop court.";
    if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Email invalide.";
    if (password && password.length < 6) e.password = "Minimum 6 caractères.";
    if (phone && phone.trim().length < 6) e.phone = "Téléphone invalide.";
    if (role === "student" && selectedSkills.length === 0) {
      e.skills = "Ajoute au moins une compétence.";
    }

    return e;
  }, [fullName, email, password, phone, selectedSkills, role]);

  const canNext =
    fullName.trim().length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    !errors.fullName &&
    !errors.email &&
    !errors.password;

  const loadSkills = async (value: string) => {
    setSkillInput(value);

    if (!value.trim()) {
      setSkillSuggestions([]);
      return;
    }

    try {
      setSkillLoading(true);
      const results = await searchSkills(value.trim());
      setSkillSuggestions(results || []);
    } catch {
      setSkillSuggestions([]);
    } finally {
      setSkillLoading(false);
    }
  };

  const addSkillToSelection = (rawSkill: string) => {
    const clean = normalizeSkill(rawSkill);
    if (!clean) return;

    if (selectedSkills.includes(clean)) {
      setSkillInput("");
      setSkillSuggestions([]);
      return;
    }

    setSelectedSkills((prev) => [...prev, clean]);
    setSkillInput("");
    setSkillSuggestions([]);
  };

  const removeSkillFromSelection = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((item) => item !== skill));
  };

  const handleCreateSkill = async () => {
    const clean = normalizeSkill(skillInput);
    if (!clean) return;

    try {
      setCreatingSkill(true);
      await createSkill(clean);
      addSkillToSelection(clean);
    } catch {
      addSkillToSelection(clean);
    } finally {
      setCreatingSkill(false);
    }
  };

  const validateStep2 = () => {
    if (!city.trim()) {
      Alert.alert("Champ requis", "La ville est requise.");
      return false;
    }

    if (role === "student") {
      if (!phone.trim()) {
        Alert.alert("Champ requis", "Le téléphone est requis.");
        return false;
      }

      if (!selectedSkills.length) {
        Alert.alert("Champ requis", "Ajoute au moins une compétence.");
        return false;
      }
    }

    if (role === "student" && candidateType === "student") {
      if (!university.trim() || !fieldOfStudy.trim() || !level.trim()) {
        Alert.alert(
          "Champs requis",
          "Université, filière et niveau d’étude sont requis.",
        );
        return false;
      }
    }

    if (role === "student" && candidateType === "worker") {
      if (
        !activitySector.trim() ||
        !yearsOfExperience.trim() ||
        !highestEducation.trim()
      ) {
        Alert.alert(
          "Champs requis",
          "Secteur, années d’expérience et dernier diplôme sont requis.",
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
        payload.phone = phone.trim();
        payload.skills = selectedSkills;

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
        e?.response?.data?.message || e?.message || "Réessaie.",
      );
    } finally {
      setLoading(false);
    }
  };

  const exactSkillExists =
    !!skillInput.trim() &&
    (selectedSkills.includes(normalizeSkill(skillInput)) ||
      skillSuggestions.some(
        (item) => item.name.toLowerCase() === skillInput.trim().toLowerCase(),
      ));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <LinearGradient
              colors={[
                "rgba(59,130,246,0.16)",
                "rgba(99,102,241,0.10)",
                "rgba(255,255,255,0)",
              ]}
              style={styles.heroGlow}
            />

            <View style={styles.topRow}>
              <Pressable
                onPress={() => (step === 1 ? router.back() : setStep(1))}
                hitSlop={10}
                style={styles.backBtn}
              >
                <Feather
                  name="chevron-left"
                  size={20}
                  color={theme.colors.text}
                />
              </Pressable>

              <View style={styles.stepPills}>
                <View
                  style={[styles.pill, step === 1 ? styles.pillActive : null]}
                />
                <View
                  style={[styles.pill, step === 2 ? styles.pillActive : null]}
                />
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
                    <Pressable
                      onPress={() => setSecure((s) => !s)}
                      hitSlop={10}
                    >
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
                        "Nom, email valide, mot de passe (6+).",
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
                    style={[
                      styles.choiceCard,
                      role === "student" && styles.choiceCardActive,
                    ]}
                    onPress={() => setRole("student")}
                  >
                    <Text style={styles.choiceTitle}>Candidat</Text>
                    <Text style={styles.choiceSub}>
                      Je cherche un emploi ou un stage
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.choiceCard,
                      role === "company" && styles.choiceCardActive,
                    ]}
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
                          candidateType === "student" &&
                            styles.choiceCardActive,
                        ]}
                        onPress={() => setCandidateType("student")}
                      >
                        <Text style={styles.choiceTitle}>Étudiant</Text>
                        <Text style={styles.choiceSub}>Profil académique</Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.choiceCard,
                          candidateType === "worker" && styles.choiceCardActive,
                        ]}
                        onPress={() => setCandidateType("worker")}
                      >
                        <Text style={styles.choiceTitle}>Travailleur</Text>
                        <Text style={styles.choiceSub}>
                          Profil professionnel
                        </Text>
                      </Pressable>
                    </View>

                    <Input
                      label="Téléphone"
                      icon="phone"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      placeholder="Ex: 6XXXXXXXX"
                      error={errors.phone}
                    />

                    <View style={styles.skillsBlock}>
                      <Text style={styles.skillsLabel}>Compétences</Text>

                      <View style={styles.skillInputWrap}>
                        <Input
                          label=""
                          icon="cpu"
                          value={skillInput}
                          onChangeText={loadSkills}
                          placeholder="Ex: React, Figma, Node.js..."
                          error={errors.skills}
                        />
                      </View>

                      {!!skillInput.trim() && !exactSkillExists && (
                        <Pressable
                          style={styles.addSkillBtn}
                          onPress={handleCreateSkill}
                          disabled={creatingSkill}
                        >
                          {creatingSkill ? (
                            <ActivityIndicator
                              size="small"
                              color={theme.colors.primary}
                            />
                          ) : (
                            <>
                              <Feather
                                name="plus"
                                size={15}
                                color={theme.colors.primary}
                              />
                              <Text style={styles.addSkillBtnText}>
                                Ajouter cette compétence
                              </Text>
                            </>
                          )}
                        </Pressable>
                      )}

                      {!!skillInput.trim() && (
                        <View style={styles.suggestionsBox}>
                          {skillLoading ? (
                            <View style={styles.suggestionLoading}>
                              <ActivityIndicator
                                size="small"
                                color={theme.colors.primary}
                              />
                            </View>
                          ) : skillSuggestions.length ? (
                            skillSuggestions.map((item) => (
                              <Pressable
                                key={item._id}
                                style={styles.suggestionItem}
                                onPress={() => addSkillToSelection(item.name)}
                              >
                                <Text style={styles.suggestionText}>
                                  {item.name}
                                </Text>
                              </Pressable>
                            ))
                          ) : (
                            <Text style={styles.emptySuggestionText}>
                              Aucune suggestion trouvée.
                            </Text>
                          )}
                        </View>
                      )}

                      {!!selectedSkills.length && (
                        <View style={styles.selectedSkillsWrap}>
                          {selectedSkills.map((skill) => (
                            <View key={skill} style={styles.skillChip}>
                              <Text style={styles.skillChipText}>{skill}</Text>
                              <Pressable
                                onPress={() => removeSkillFromSelection(skill)}
                                hitSlop={8}
                              >
                                <Feather
                                  name="x"
                                  size={14}
                                  color={theme.colors.primary}
                                />
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    {candidateType === "student" ? (
                      <>
                        <Input
                          label="Université / École"
                          icon="book-open"
                          value={university}
                          onChangeText={setUniversity}
                          placeholder="Ex: Université de Douala"
                        />
                        <Input
                          label="Filière"
                          icon="layers"
                          value={fieldOfStudy}
                          onChangeText={setFieldOfStudy}
                          placeholder="Ex: Génie Logiciel"
                        />
                        <Input
                          label="Niveau"
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
                          icon="bar-chart-2"
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
            En continuant, tu acceptes les conditions et la politique de
            confidentialité.
          </Text>
        </ScrollView>
      </SafeAreaView>
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
    fontWeight: "600",
    lineHeight: 18,
  },
  footer: {
    marginTop: theme.spacing.lg,
    color: theme.colors.faint,
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  skillsBlock: {
    marginBottom: 16,
  },
  skillsLabel: {
    color: theme.colors.muted,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  skillInputWrap: {
    marginBottom: 8,
  },
  addSkillBtn: {
    minHeight: 42,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(59,130,246,0.08)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.18)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  addSkillBtnText: {
    color: theme.colors.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  suggestionsBox: {
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    backgroundColor: theme.colors.surface2,
    borderRadius: 16,
    marginBottom: 10,
    overflow: "hidden",
  },
  suggestionLoading: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stroke,
  },
  suggestionText: {
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: "700",
  },
  emptySuggestionText: {
    color: theme.colors.muted,
    fontSize: 12.5,
    fontWeight: "600",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectedSkillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.08)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.18)",
  },
  skillChipText: {
    color: theme.colors.primary,
    fontSize: 12.5,
    fontWeight: "800",
  },
});
