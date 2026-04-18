import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { theme } from "../../constants/theme";
import { createJob } from "../../src/services/jobs";

export default function CreateJobScreen() {
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [city, setCity] = useState("");
  const [contractType, setContractType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      title.trim().length >= 3 &&
      domain.trim().length >= 2 &&
      city.trim().length >= 2 &&
      contractType.trim().length >= 2 &&
      description.trim().length >= 20
    );
  }, [title, domain, city, contractType, description]);

  const onSubmit = async () => {
    if (!canSubmit) {
      return Alert.alert(
        "Formulaire incomplet",
        "Renseigne les champs principaux de l’offre."
      );
    }

    try {
      setLoading(true);

      await createJob({
        title: title.trim(),
        domain: domain.trim(),
        city: city.trim(),
        contractType: contractType.trim(),
        workMode: workMode.trim(),
        salary: salary.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
      });

      Alert.alert("Succès", "Offre publiée avec succès.");
      router.replace("/(company-tabs)/publications");
    } catch (e: any) {
      Alert.alert(
        "Publication impossible",
        e?.response?.data?.message || "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={18} color={theme.colors.text} />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Publier une offre</Text>
              <Text style={styles.sub}>
                Crée une annonce propre et claire pour attirer les bons candidats.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Input
              label="Titre du poste"
              icon="briefcase"
              value={title}
              onChangeText={setTitle}
              placeholder="Ex: Développeur Frontend React"
            />

            <Input
              label="Domaine"
              icon="layers"
              value={domain}
              onChangeText={setDomain}
              placeholder="Ex: Développement web"
            />

            <Input
              label="Ville"
              icon="map-pin"
              value={city}
              onChangeText={setCity}
              placeholder="Ex: Douala"
            />

            <Input
              label="Type de contrat"
              icon="file-text"
              value={contractType}
              onChangeText={setContractType}
              placeholder="Ex: CDI / Stage / Freelance"
            />

            <Input
              label="Mode de travail"
              icon="monitor"
              value={workMode}
              onChangeText={setWorkMode}
              placeholder="Ex: Présentiel / Hybride / Remote"
            />

            <Input
              label="Salaire (optionnel)"
              icon="credit-card"
              value={salary}
              onChangeText={setSalary}
              placeholder="Ex: 250000 FCFA"
            />

            <Input
              label="Description"
              icon="align-left"
              value={description}
              onChangeText={setDescription}
              placeholder="Décris la mission, les responsabilités, le contexte..."
              multiline
              inputStyle={styles.multiline}
            />

            <Input
              label="Exigences (optionnel)"
              icon="check-square"
              value={requirements}
              onChangeText={setRequirements}
              placeholder="Compétences, stack, expérience..."
              multiline
              inputStyle={styles.multiline}
            />

            <Button
              title={loading ? "Publication..." : "Publier l’offre"}
              onPress={onSubmit}
              loading={loading}
              disabled={!canSubmit || loading}
              style={{ marginTop: 8 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    padding: 18,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  sub: {
    marginTop: 6,
    color: theme.colors.muted,
    lineHeight: 20,
    fontWeight: "600",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: 18,
    gap: 12,
    ...theme.shadow.soft,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
    paddingTop: 14,
  },
});