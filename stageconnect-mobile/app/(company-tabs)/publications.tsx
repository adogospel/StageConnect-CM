import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { theme } from "../../constants/theme";
import { getMyCompanyProfile } from "../../src/services/company";
import { deleteJob, getMyCompanyJobs } from "../../src/services/jobs";

type CompanyProfile = {
  _id: string;
  companyName: string;
  sector: string;
  city: string;
  phone: string;
  description?: string;
  isVerified: boolean;
  verificationStatus: "not_submitted" | "pending" | "verified" | "rejected";
  verificationNote?: string;
};

type JobItem = {
  _id: string;
  title: string;
  city: string;
  domain: string;
  contractType: string;
  workMode?: string;
  salary?: string;
  isPaid?: boolean;
  isActive?: boolean;
  createdAt?: string;
};

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PublicationsScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [profileData, jobsData] = await Promise.all([
        getMyCompanyProfile(),
        getMyCompanyJobs(),
      ]);

      setProfile(profileData);
      setJobs(
        (Array.isArray(jobsData) ? jobsData : []).filter(
          (job) => job.isActive !== false
        )
      );
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || "Impossible de charger les publications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const verificationState = useMemo(() => {
    if (!profile) return null;

    if (profile.isVerified && profile.verificationStatus === "verified") {
      return {
        tone: "success" as const,
        title: "Entreprise vérifiée",
        message:
          "Ton entreprise est validée. Tu peux publier des offres d’emploi.",
        icon: "check-circle",
      };
    }

    if (profile.verificationStatus === "pending") {
      return {
        tone: "warning" as const,
        title: "Validation en attente",
        message:
          "Tes documents ont été envoyés à l’admin. La publication reste bloquée jusqu’à validation.",
        icon: "clock",
      };
    }

    if (profile.verificationStatus === "rejected") {
      return {
        tone: "danger" as const,
        title: "Validation rejetée",
        message:
          profile.verificationNote ||
          "Tes documents ont été rejetés. Merci de corriger puis renvoyer un dossier.",
        icon: "x-circle",
      };
    }

    return {
      tone: "neutral" as const,
      title: "Documents non envoyés",
      message:
        "Tu dois envoyer les documents de vérification avant de pouvoir publier une offre.",
      icon: "shield",
    };
  }, [profile]);

  const canPublish =
    !!profile &&
    profile.isVerified === true &&
    profile.verificationStatus === "verified";

  const handlePublish = () => {
    if (!canPublish) {
      return router.push("/company/verification");
    }
    router.push("/company/create-job");
  };

  const handleDelete = (jobId: string) => {
    Alert.alert(
      "Supprimer l’offre",
      "Cette offre sera retirée des listes visibles.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(jobId);
              await deleteJob(jobId);
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setJobs((prev) => prev.filter((job) => job._id !== jobId));
            } catch (e: any) {
              Alert.alert(
                "Erreur",
                e?.response?.data?.message || "Impossible de supprimer."
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const badgeStyles = (tone: "success" | "warning" | "danger" | "neutral") => {
    switch (tone) {
      case "success":
        return {
          wrap: {
            backgroundColor: "#ECFDF3",
            borderColor: "#BBF7D0",
          },
          iconBg: { backgroundColor: "#D1FAE5" },
          title: { color: "#166534" },
          text: { color: "#166534" },
        };
      case "warning":
        return {
          wrap: {
            backgroundColor: "#FFF7ED",
            borderColor: "#FED7AA",
          },
          iconBg: { backgroundColor: "#FFEDD5" },
          title: { color: "#9A3412" },
          text: { color: "#9A3412" },
        };
      case "danger":
        return {
          wrap: {
            backgroundColor: "#FEF2F2",
            borderColor: "#FECACA",
          },
          iconBg: { backgroundColor: "#FEE2E2" },
          title: { color: "#991B1B" },
          text: { color: "#991B1B" },
        };
      default:
        return {
          wrap: {
            backgroundColor: "#F8FAFC",
            borderColor: "#E2E8F0",
          },
          iconBg: { backgroundColor: "#E2E8F0" },
          title: { color: "#0F172A" },
          text: { color: "#475569" },
        };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const tone = verificationState?.tone || "neutral";
  const currentBadge = badgeStyles(tone);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.eyebrow}>Entreprise</Text>
              <Text style={styles.title}>Mes offres</Text>
              <Text style={styles.subtitle}>
                Gère tes annonces, tes candidats et l’état de validation.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Feather name="briefcase" size={20} color={theme.colors.primary} />
            </View>
          </View>

          <Pressable
            style={[
              styles.publishButton,
              !canPublish && styles.publishButtonDisabled,
            ]}
            onPress={handlePublish}
          >
            <Feather
              name={canPublish ? "plus-circle" : "lock"}
              size={18}
              color="#fff"
            />
            <Text style={styles.publishButtonText}>
              {canPublish ? "Publier une offre" : "Débloquer la publication"}
            </Text>
          </Pressable>
        </View>

        {verificationState && (
          <View style={[styles.statusCard, currentBadge.wrap as any]}>
            <View style={[styles.statusIconWrap, currentBadge.iconBg as any]}>
              <Feather
                name={verificationState.icon as any}
                size={18}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.statusContent}>
              <Text style={[styles.statusTitle, currentBadge.title as any]}>
                {verificationState.title}
              </Text>
              <Text style={[styles.statusText, currentBadge.text as any]}>
                {verificationState.message}
              </Text>

              {!canPublish && (
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => router.push("/company/verification")}
                >
                  <Feather name="shield" size={16} color={theme.colors.primary} />
                  <Text style={styles.secondaryButtonText}>
                    Aller à la vérification
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Offres publiées</Text>
            <Text style={styles.sectionMeta}>{jobs.length} active(s)</Text>
          </View>

          {jobs.length === 0 ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Feather name="inbox" size={20} color={theme.colors.faint} />
              </View>
              <Text style={styles.emptyTitle}>Aucune offre active</Text>
              <Text style={styles.emptyText}>
                {canPublish
                  ? "Tu n’as pas encore publié d’offre."
                  : "Finalise la vérification pour commencer à publier."}
              </Text>
            </View>
          ) : (
            <View style={styles.jobsList}>
              {jobs.map((job) => (
                <View key={job._id} style={styles.jobCard}>
                  <View style={styles.jobTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.jobMeta}>
                        {job.city} • {job.domain}
                      </Text>
                    </View>

                    <View style={styles.jobStatusChip}>
                      <Text style={styles.jobStatusText}>Active</Text>
                    </View>
                  </View>

                  <View style={styles.jobBottom}>
                    <Text style={styles.jobSubMeta}>
                      {job.contractType}
                      {job.workMode ? ` • ${job.workMode}` : ""}
                    </Text>
                    <Text style={styles.jobSubMeta}>
                      {formatDate(job.createdAt)}
                    </Text>
                  </View>

                  {!!job.salary && (
                    <Text style={styles.salaryText}>Salaire : {job.salary}</Text>
                  )}

                  <View style={styles.actionsRow}>
                    <Pressable
                      style={styles.outlineAction}
                      onPress={() =>
                        router.push({
                          pathname: "/company/company-candidates/[jobId]",
                          params: { jobId: job._id },
                        })
                      }
                    >
                      <Feather name="users" size={16} color={theme.colors.primary} />
                      <Text style={styles.outlineActionText}>Voir candidats</Text>
                    </Pressable>

                    <Pressable
                      style={styles.dangerAction}
                      onPress={() => handleDelete(job._id)}
                      disabled={deletingId === job._id}
                    >
                      <Feather name="trash-2" size={16} color="#DC2626" />
                      <Text style={styles.dangerActionText}>
                        {deletingId === job._id ? "Suppression..." : "Supprimer"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F8FC" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 18, paddingBottom: 32, gap: 16 },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 2,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.primary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 8,
    color: "#64748B",
    lineHeight: 21,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  publishButton: {
    marginTop: 18,
    height: 54,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  publishButtonDisabled: {
    opacity: 0.72,
  },
  publishButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  statusCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
  },
  statusIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusContent: { flex: 1 },
  statusTitle: { fontSize: 16, fontWeight: "900" },
  statusText: { marginTop: 6, lineHeight: 21 },
  secondaryButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E3F4",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },
  sectionMeta: {
    color: "#64748B",
    fontWeight: "700",
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 18,
  },
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: "#64748B",
    lineHeight: 21,
  },
  jobsList: { gap: 12 },
  jobCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  jobTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
  jobMeta: { marginTop: 5, color: "#64748B" },
  jobBottom: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  jobSubMeta: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 12.5,
  },
  salaryText: {
    marginTop: 10,
    color: theme.colors.primary,
    fontWeight: "800",
  },
  jobStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#ECFDF3",
  },
  jobStatusText: {
    color: "#166534",
    fontWeight: "800",
    fontSize: 12,
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  outlineAction: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7E3F4",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  outlineActionText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  dangerAction: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  dangerActionText: {
    color: "#DC2626",
    fontWeight: "800",
  },
});