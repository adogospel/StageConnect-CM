import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { theme } from "../../../constants/theme";
import {
  getApplicationsByJob,
  updateApplicationStatus,
} from "../../../src/services/applications";
import { SafeAreaView } from "react-native-safe-area-context";

type AppItem = {
  _id: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  coverLetter?: string;
  createdAt?: string;
  student?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    university?: string;
    fieldOfStudy?: string;
    level?: string;
    city?: string;
    phone?: string;
    email?: string;
    skills?: string[];
    summary?: string;
    experience?: string;
    cvUrl?: string;
  };
};

export default function CompanyCandidates() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getApplicationsByJob(String(jobId));
      setApps(data?.applications ?? []);
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message ||
          e?.message ||
          "Impossible de charger les candidats."
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) load();
  }, [jobId, load]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getApplicationsByJob(String(jobId));
      setApps(data?.applications ?? []);
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || e?.message || "Refresh impossible."
      );
    } finally {
      setRefreshing(false);
    }
  }, [jobId]);

  const setStatus = async (
    id: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      setActingId(id);
      await updateApplicationStatus(id, status);
      setApps((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status } : item
        )
      );
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || e?.message || "Action impossible."
      );
    } finally {
      setActingId(null);
    }
  };

  const stats = useMemo(() => {
    return {
      total: apps.length,
      pending: apps.filter((a) => a.status === "pending").length,
      accepted: apps.filter((a) => a.status === "accepted").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
    };
  }, [apps]);

  const statusTone = (status: AppItem["status"]) => {
    if (status === "accepted") {
      return {
        bg: "#ECFDF3",
        text: "#166534",
        label: "Accepté",
      };
    }

    if (status === "rejected") {
      return {
        bg: "#FEF2F2",
        text: "#991B1B",
        label: "Refusé",
      };
    }

    return {
      bg: "#FFF7ED",
      text: "#9A3412",
      label: "En attente",
    };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={20} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.topTitle}>Candidats</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Gestion des candidatures</Text>
          <Text style={styles.heroText}>
            Consulte chaque profil, lis la motivation et décide rapidement.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.accepted}</Text>
            <Text style={styles.statLabel}>Acceptés</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.muted}>Chargement…</Text>
          </View>
        ) : apps.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Aucune candidature</Text>
            <Text style={styles.muted}>
              Reviens plus tard ou partage ton offre.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {apps.map((a) => {
              const s = a?.student;
              const tone = statusTone(a.status);

              return (
                <View key={a._id} style={styles.candCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.avatar}>
                      <Feather
                        name="user"
                        size={16}
                        color={theme.colors.primary}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>
                        {(s?.firstName || "—")} {(s?.lastName || "")}
                      </Text>

                      <Text style={styles.info}>
                        {(s?.university || "—")} • {(s?.fieldOfStudy || "—")} •{" "}
                        {(s?.level || "—")}
                      </Text>

                      <Text style={styles.info2}>
                        {(s?.city || "Ville non précisée")}
                        {s?.phone ? ` • ${s.phone}` : ""}
                      </Text>
                    </View>

                    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.badgeText, { color: tone.text }]}>
                        {tone.label}
                      </Text>
                    </View>
                  </View>

                  {!!(a.message || a.coverLetter) && (
                    <Text style={styles.msg} numberOfLines={3}>
                      “{a.message || a.coverLetter}”
                    </Text>
                  )}

                  <View style={styles.bottomActions}>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/company/candidate-details/[applicationId]",
                          params: { applicationId: a._id },
                        })
                      }
                      style={styles.detailsBtn}
                    >
                      <Feather
                        name="eye"
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.detailsText}>Voir les détails</Text>
                    </Pressable>

                    <View style={styles.rightActions}>
                      <Pressable
                        onPress={() => setStatus(a._id, "accepted")}
                        style={[styles.actionBtn, styles.accept]}
                        disabled={actingId === a._id}
                      >
                        <Feather name="check" size={16} color="#fff" />
                      </Pressable>

                      <Pressable
                        onPress={() => setStatus(a._id, "rejected")}
                        style={[styles.actionBtn, styles.reject]}
                        disabled={actingId === a._id}
                      >
                        <Feather name="x" size={16} color="#fff" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 26 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  },
  hero: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
    marginBottom: 14,
  },
  heroTitle: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 17,
  },
  heroText: {
    color: theme.colors.muted,
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 18,
  },
  statLabel: {
    color: theme.colors.muted,
    marginTop: 4,
    fontWeight: "700",
    fontSize: 12,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  cardTitle: { color: theme.colors.text, fontWeight: "900", fontSize: 15 },
  muted: { color: theme.colors.muted, marginTop: 8, fontWeight: "700" },
  candCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: theme.colors.text,
    fontWeight: "900",
    fontSize: 14.5,
  },
  info: {
    color: theme.colors.muted,
    marginTop: 6,
    fontWeight: "700",
    fontSize: 12.5,
    lineHeight: 18,
  },
  info2: {
    color: theme.colors.faint,
    marginTop: 4,
    fontWeight: "700",
    fontSize: 12.2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  badgeText: {
    fontWeight: "900",
    fontSize: 12,
  },
  msg: {
    color: theme.colors.muted,
    marginTop: 12,
    fontWeight: "700",
    lineHeight: 19,
  },
  bottomActions: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailsBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D7E3F4",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  detailsText: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  rightActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  accept: { backgroundColor: theme.colors.success },
  reject: { backgroundColor: theme.colors.danger },
});