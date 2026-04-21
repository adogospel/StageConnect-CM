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

const API_BASE_URL = "http://192.168.100.238:5000"; // ⚠️ mets ici la même IP que ton apiClient

function buildFileUrl(filePath?: string) {
  if (!filePath) return "";

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }

  return `${API_BASE_URL}${filePath}`;
}

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
    const rawCvUrl = application?.cvUrl || candidate?.cvUrl || "";
    const finalCvUrl = buildFileUrl(rawCvUrl);

    if (!finalCvUrl) {
      return Alert.alert("CV indisponible", "Aucun CV trouvé pour ce candidat.");
    }

    try {
      const supported = await Linking.canOpenURL(finalCvUrl);

      if (!supported) {
        return Alert.alert("Erreur", "Impossible d’ouvrir ce fichier.");
      }

      await Linking.openURL(finalCvUrl);
    } catch {
      Alert.alert("Erreur", "Impossible d’ouvrir le CV.");
    }
  };

  const callUser = async () => {
    if (!candidate?.phone) {
      return Alert.alert("Numéro non disponible");
    }

    try {
      await Linking.openURL(`tel:${candidate.phone}`);
    } catch {
      Alert.alert("Erreur appel");
    }
  };

  const openWhatsapp = async () => {
    if (!candidate?.phone) {
      return Alert.alert("Numéro non disponible");
    }

    try {
      const phone = String(candidate.phone).replace(/\D/g, "");
      await Linking.openURL(`https://wa.me/${phone}`);
    } catch {
      Alert.alert("Erreur", "Impossible d’ouvrir WhatsApp.");
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
          <Text style={styles.sectionTitle}>
            {candidate?.candidateType === "worker"
              ? "Profil professionnel"
              : "Profil académique"}
          </Text>

          {candidate?.candidateType === "worker" ? (
            <>
              <InfoRow label="Secteur" value={candidate?.activitySector} />
              <InfoRow
                label="Expérience"
                value={
                  candidate?.yearsOfExperience !== undefined &&
                  candidate?.yearsOfExperience !== null
                    ? `${candidate.yearsOfExperience} an(s)`
                    : undefined
                }
              />
              <InfoRow
                label="Dernier diplôme"
                value={candidate?.highestEducation}
              />
            </>
          ) : (
            <>
              <InfoRow label="Université" value={candidate?.university} />
              <InfoRow label="Filière" value={candidate?.fieldOfStudy} />
              <InfoRow label="Niveau" value={candidate?.level} />
            </>
          )}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>

          <View style={styles.actionsRow}>
            <Pressable style={styles.actionBtn} onPress={callUser}>
              <Feather name="phone" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Appeler</Text>
            </Pressable>

            <Pressable style={styles.actionBtnOutline} onPress={openWhatsapp}>
              <Feather name="message-circle" size={16} color={theme.colors.primary} />
              <Text style={styles.actionBtnOutlineText}>WhatsApp</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.cvBtn} onPress={openCv}>
          <Feather name="file-text" size={18} color="#fff" />
          <Text style={styles.cvBtnText}>
            {application?.cvOriginalName
              ? `Voir le CV (${application.cvOriginalName})`
              : "Voir le CV"}
          </Text>
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
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.10)",
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
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
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
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.10)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.18)",
  },
  skillText: {
    color: theme.colors.primary,
    fontSize: 12.5,
    fontWeight: "800",
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  paragraph: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "800",
  },
  actionBtnOutline: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  actionBtnOutlineText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  cvBtn: {
    backgroundColor: theme.colors.primary,
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  cvBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});