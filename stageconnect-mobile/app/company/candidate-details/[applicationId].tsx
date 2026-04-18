import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { theme } from "../../../constants/theme";
import { getApplicationById } from "../../../src/services/applications";

export default function CandidateDetailsScreen() {
  const { applicationId } = useLocalSearchParams<{ applicationId: string }>();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getApplicationById(String(applicationId));
        setApplication(data?.application || data);
      } catch (e: any) {
        Alert.alert(
          "Erreur",
          e?.response?.data?.message ||
            e?.message ||
            "Impossible de charger les détails."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [applicationId]);

  const candidate = useMemo(() => application?.student || {}, [application]);

  const openCv = async () => {
    const cvUrl = candidate?.cvUrl || application?.cvUrl;
    if (!cvUrl) {
      return Alert.alert("CV indisponible", "Aucun CV trouvé pour ce candidat.");
    }

    try {
      await Linking.openURL(cvUrl);
    } catch {
      Alert.alert("Erreur", "Impossible d’ouvrir le CV.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: theme.colors.muted }}>
            Détails indisponibles.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const fullName = `${candidate?.firstName || ""} ${candidate?.lastName || ""}`.trim();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={20} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.topTitle}>Détails du candidat</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Feather name="user" size={20} color={theme.colors.primary} />
          </View>

          <Text style={styles.name}>{fullName || "Candidat"}</Text>
          <Text style={styles.meta}>
            {candidate?.city || "Ville non précisée"}
            {candidate?.email ? ` • ${candidate.email}` : ""}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil académique</Text>
          <InfoRow label="Université" value={candidate?.university} />
          <InfoRow label="Filière" value={candidate?.fieldOfStudy} />
          <InfoRow label="Niveau" value={candidate?.level} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          <InfoRow label="Téléphone" value={candidate?.phone} />
          <InfoRow label="Ville" value={candidate?.city} />
          <InfoRow label="Email" value={candidate?.email} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compétences</Text>
          {candidate?.skills?.length ? (
            <View style={styles.skillsWrap}>
              {candidate.skills.map((skill: string, index: number) => (
                <View key={`${skill}-${index}`} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Aucune compétence renseignée.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé / bio</Text>
          <Text style={styles.paragraph}>
            {candidate?.summary ||
              candidate?.experience ||
              "Aucune présentation ajoutée."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lettre de motivation</Text>
          <Text style={styles.paragraph}>
            {application?.message ||
              application?.coverLetter ||
              "Aucune lettre de motivation fournie."}
          </Text>
        </View>

        <Pressable style={styles.cvBtn} onPress={openCv}>
          <Feather name="file-text" size={18} color="#fff" />
          <Text style={styles.cvBtnText}>Voir le CV</Text>
        </Pressable>

        <View style={{ height: 26 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Non renseigné"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stroke,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: 14,
  },
  hero: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  name: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  meta: {
    color: theme.colors.muted,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 20,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 15,
    marginBottom: 12,
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stroke,
  },
  infoLabel: {
    color: theme.colors.faint,
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoValue: {
    color: theme.colors.text,
    fontWeight: "700",
    lineHeight: 20,
  },
  paragraph: {
    color: theme.colors.muted,
    fontWeight: "700",
    lineHeight: 22,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  skillText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: 12.5,
  },
  emptyText: {
    color: theme.colors.muted,
    fontWeight: "700",
  },
  cvBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  cvBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
});