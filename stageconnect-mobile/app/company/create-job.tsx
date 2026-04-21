import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { theme } from "../../constants/theme";
import { createJob } from "../../src/services/jobs";

type FormState = {
  title: string;
  city: string;
  domain: string;
  contractType: string;
  workMode: string;
  duration: string;
  salary: string;
  deadline: string;
  requirements: string;
  benefits: string;
  description: string;
  isPaid: boolean;
};

const CONTRACT_TYPES = [
  "CDI",
  "CDD",
  "Stage",
  "Alternance",
  "Freelance",
  "Temps partiel",
];

const WORK_MODES = ["Présentiel", "Hybride", "Remote"];

export default function CreateJobScreen() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: "",
    city: "",
    domain: "",
    contractType: "CDI",
    workMode: "Présentiel",
    duration: "",
    salary: "",
    deadline: "",
    requirements: "",
    benefits: "",
    description: "",
    isPaid: false,
  });

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};

    if (!form.title.trim()) e.title = "Le titre est requis.";
    if (!form.city.trim()) e.city = "La ville est requise.";
    if (!form.domain.trim()) e.domain = "Le domaine est requis.";
    if (!form.contractType.trim()) e.contractType = "Le type est requis.";
    if (!form.description.trim()) e.description = "La description est requise.";

    if (form.deadline.trim()) {
      const ok = /^\d{4}-\d{2}-\d{2}$/.test(form.deadline.trim());
      if (!ok) {
        e.deadline = "Format attendu : YYYY-MM-DD";
      }
    }

    return e;
  }, [form]);

  const canSubmit =
    form.title.trim() &&
    form.city.trim() &&
    form.domain.trim() &&
    form.contractType.trim() &&
    form.description.trim() &&
    !errors.deadline;

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert(
        "Formulaire incomplet",
        "Renseigne au minimum le titre, la ville, le domaine, le type de contrat et la description."
      );
      return;
    }

    try {
      setLoading(true);

      await createJob({
        title: form.title.trim(),
        description: form.description.trim(),
        city: form.city.trim(),
        domain: form.domain.trim(),
        contractType: form.contractType.trim(),
        workMode: form.workMode.trim(),
        duration: form.duration.trim(),
        salary: form.isPaid ? form.salary.trim() : "",
        requirements: form.requirements.trim(),
        benefits: form.benefits.trim(),
        deadline: form.deadline.trim(),
      });

      Alert.alert("Succès", "Offre publiée avec succès.", [
        {
          text: "OK",
          onPress: () => router.replace("/(company-tabs)/publications"),
        },
      ]);
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message ||
          e?.message ||
          "Impossible de publier l’offre."
      );
    } finally {
      setLoading(false);
    }
  };

  const ChipGroup = ({
    options,
    value,
    onChange,
  }: {
    options: string[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <View style={styles.chipsWrap}>
      {options.map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const InputBlock = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    error,
    keyboardType,
  }: {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder?: string;
    multiline?: boolean;
    error?: string;
    keyboardType?: "default" | "numeric";
  }) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputShell,
          multiline && styles.inputShellMultiline,
          !!error && styles.inputShellError,
        ]}
      >
        <Text
          style={[
            styles.fakeInputText,
            !value ? styles.fakePlaceholder : null,
            multiline ? styles.multilineText : null,
          ]}
        >
          {/* hack only to keep consistent vertical alignment if custom input component absent */}
        </Text>
      </View>
      <View
        style={[
          styles.realInputWrap,
          multiline && styles.realInputWrapMultiline,
          !!error && styles.inputShellError,
        ]}
      >
        <TextInputBase
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          keyboardType={keyboardType}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable style={styles.iconBtn} onPress={() => router.back()}>
              <Feather name="chevron-left" size={22} color={theme.colors.text} />
            </Pressable>

            <View style={styles.topBarCenter}>
              <Text style={styles.pageTitle}>Publier une offre</Text>
              <Text style={styles.pageSubTitle}>
                Emploi ou stage, avec toutes les infos utiles.
              </Text>
            </View>

            <View style={styles.iconGhost} />
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Feather name="briefcase" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Création d’offre</Text>
              <Text style={styles.heroText}>
                J’ai ajouté ici les champs <Text style={styles.heroTextStrong}>Durée</Text> et{" "}
                <Text style={styles.heroTextStrong}>Date limite</Text> pour éviter qu’ils
                s’affichent vides côté étudiant.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <SectionTitle title="Informations principales" />

            <LabeledInput
              label="Titre du poste"
              value={form.title}
              onChangeText={(v) => updateField("title", v)}
              placeholder="Ex: Développeur Frontend React"
              error={errors.title}
            />

            <LabeledInput
              label="Ville"
              value={form.city}
              onChangeText={(v) => updateField("city", v)}
              placeholder="Ex: Douala"
              error={errors.city}
            />

            <LabeledInput
              label="Domaine"
              value={form.domain}
              onChangeText={(v) => updateField("domain", v)}
              placeholder="Ex: Informatique"
              error={errors.domain}
            />

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Type de contrat</Text>
              <ChipGroup
                options={CONTRACT_TYPES}
                value={form.contractType}
                onChange={(v) => updateField("contractType", v)}
              />
              {!!errors.contractType && (
                <Text style={styles.errorText}>{errors.contractType}</Text>
              )}
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Mode de travail</Text>
              <ChipGroup
                options={WORK_MODES}
                value={form.workMode}
                onChange={(v) => updateField("workMode", v)}
              />
            </View>
          </View>

          <View style={styles.card}>
            <SectionTitle title="Conditions" />

            <LabeledInput
              label="Durée"
              value={form.duration}
              onChangeText={(v) => updateField("duration", v)}
              placeholder="Ex: 6 mois"
            />

            <LabeledInput
              label="Date limite"
              value={form.deadline}
              onChangeText={(v) => updateField("deadline", v)}
              placeholder="YYYY-MM-DD"
              error={errors.deadline}
            />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Offre rémunérée</Text>
                <Text style={styles.switchHint}>
                  Active cette option si un salaire ou une gratification est prévu.
                </Text>
              </View>
              <Switch
                value={form.isPaid}
                onValueChange={(v) => updateField("isPaid", v)}
                trackColor={{ false: "#D8E1EE", true: "#93C5FD" }}
                thumbColor={form.isPaid ? theme.colors.primary : "#fff"}
              />
            </View>

            <LabeledInput
              label="Rémunération"
              value={form.salary}
              onChangeText={(v) => updateField("salary", v)}
              placeholder="Ex: 150 000 FCFA"
              editable={form.isPaid}
            />
          </View>

          <View style={styles.card}>
            <SectionTitle title="Contenu de l’offre" />

            <LabeledInput
              label="Exigences"
              value={form.requirements}
              onChangeText={(v) => updateField("requirements", v)}
              placeholder="Compétences attendues, outils, niveau..."
              multiline
            />

            <LabeledInput
              label="Avantages"
              value={form.benefits}
              onChangeText={(v) => updateField("benefits", v)}
              placeholder="Ex: Encadrement, primes, cadre flexible..."
              multiline
            />

            <LabeledInput
              label="Description"
              value={form.description}
              onChangeText={(v) => updateField("description", v)}
              placeholder="Décris le poste, les missions et le profil recherché..."
              multiline
              error={errors.description}
            />
          </View>

          <Pressable
            style={[styles.submitBtn, (!canSubmit || loading) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || loading}
          >
            <Feather name="send" size={17} color="#fff" />
            <Text style={styles.submitBtnText}>
              {loading ? "Publication..." : "Publier l’offre"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  error,
  editable = true,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  error?: string;
  editable?: boolean;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          multiline && styles.inputWrapMultiline,
          !!error && styles.inputWrapError,
          !editable && styles.inputWrapDisabled,
        ]}
      >
        <RNTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          editable={editable}
        />
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function RNTextInput({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  editable = true,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
}) {
  const { TextInput } = require("react-native");
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      multiline={multiline}
      editable={editable}
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        !editable && styles.inputDisabled,
      ]}
      textAlignVertical={multiline ? "top" : "center"}
    />
  );
}

function TextInputBase({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
}) {
  const { TextInput } = require("react-native");
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      multiline={multiline}
      keyboardType={keyboardType}
      style={[styles.input, multiline && styles.inputMultiline]}
      textAlignVertical={multiline ? "top" : "center"}
    />
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 120,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  topBarCenter: {
    flex: 1,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  iconGhost: {
    width: 42,
    height: 42,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.text,
  },
  pageSubTitle: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.muted,
    fontWeight: "600",
  },
  heroCard: {
    flexDirection: "row",
    gap: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#D7E6FF",
    marginBottom: 16,
  },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4,
  },
  heroText: {
    color: "#475569",
    lineHeight: 20,
    fontWeight: "600",
  },
  heroTextStrong: {
    fontWeight: "900",
    color: "#1E3A8A",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: theme.colors.text,
    marginBottom: 14,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputWrap: {
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    backgroundColor: "#fff",
    borderRadius: 16,
    minHeight: 52,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  inputWrapMultiline: {
    minHeight: 120,
    paddingVertical: 12,
  },
  inputWrapError: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF7F7",
  },
  inputWrapDisabled: {
    backgroundColor: "#F8FAFC",
    opacity: 0.7,
  },
  input: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "600",
    minHeight: 24,
    paddingVertical: 0,
  },
  inputMultiline: {
    minHeight: 92,
  },
  inputDisabled: {
    color: "#94A3B8",
  },
  errorText: {
    marginTop: 6,
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D7E3F4",
    backgroundColor: "#FFFFFF",
  },
  chipActive: {
    backgroundColor: "#E8F1FF",
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: "#475569",
    fontWeight: "800",
    fontSize: 12.5,
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  switchHint: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600",
  },
  submitBtn: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },

  fakeInputText: {
    height: 0,
    opacity: 0,
  },
  fakePlaceholder: {},
  multilineText: {},
  inputShell: {},
  inputShellMultiline: {},
  realInputWrap: {},
  realInputWrapMultiline: {},
  inputShellError: {},
});