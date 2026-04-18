import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "../../constants/theme";
import { getJobs } from "../../src/services/jobs";

type Job = {
  id: string;
  title: string;
  company: string;
  city: string;
  contractType: string;
  isPaid: boolean;
  domain: string;
  premium: boolean;
  createdAtLabel: string;
};

type ChipKey = "all" | "paid" | "remote" | "tech";

function daysAgoLabel(dateIso?: string) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Aujourd’hui";
  if (days === 1) return "Hier";
  return `Il y a ${days}j`;
}

function normalizeJobs(apiJobs: any[]): Job[] {
  return (apiJobs || []).map((j: any) => {
    const companyName = j?.company?.companyName || "Entreprise";
    const city = j?.city || j?.company?.city || "—";

    return {
      id: j?._id,
      title: j?.title || "Offre",
      company: companyName,
      city,
      contractType: j?.contractType || "—",
      isPaid: !!j?.isPaid,
      domain: j?.domain || "—",
      premium: !!j?.isPremium,
      createdAtLabel: daysAgoLabel(j?.createdAt),
    };
  });
}

export default function Jobs() {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<ChipKey>("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJobs();
      const list = Array.isArray(data) ? data : data?.jobs ?? data?.data ?? [];
      setJobs(normalizeJobs(list));
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || e?.message || "Impossible de charger les offres."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getJobs();
      const list = Array.isArray(data) ? data : data?.jobs ?? data?.data ?? [];
      setJobs(normalizeJobs(list));
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || e?.message || "Refresh impossible."
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return jobs.filter((j) => {
      const matchQuery =
        !query ||
        j.title.toLowerCase().includes(query) ||
        j.company.toLowerCase().includes(query) ||
        j.domain.toLowerCase().includes(query) ||
        j.city.toLowerCase().includes(query);

      const matchChip =
        chip === "all" ||
        (chip === "paid" && j.isPaid) ||
        (chip === "remote" &&
          ["remote", "hybride"].includes(j.contractType.toLowerCase())) ||
        (chip === "tech" &&
          (j.domain.toLowerCase().includes("informat") ||
            j.domain.toLowerCase().includes("dev") ||
            j.domain.toLowerCase().includes("tech")));

      return matchQuery && matchChip;
    });
  }, [jobs, q, chip]);

  const openJob = (id: string) => {
    router.push(`/student/job/${id}` as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient
          colors={["#EAF2FF", "#F7FAFF", "#FFFFFF"]}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Trouve un emploi</Text>
          <Text style={styles.heroSub}>
            Offres premium, stages, CDD, CDI, freelance et plus.
          </Text>

          <View style={styles.searchWrap}>
            <Feather name="search" size={18} color={theme.colors.faint} />
            <TextInput
              placeholder="Rechercher un poste, une ville, un domaine..."
              placeholderTextColor={theme.colors.faint}
              style={styles.searchInput}
              value={q}
              onChangeText={setQ}
            />
          </View>
        </LinearGradient>

        <View style={styles.chipsRow}>
          {[
            ["all", "Tous"],
            ["paid", "Rémunérés"],
            ["remote", "Remote"],
            ["tech", "Tech"],
          ].map(([key, label]) => {
            const active = chip === key;
            return (
              <Pressable
                key={key}
                onPress={() => setChip(key as ChipKey)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Aucune offre trouvée</Text>
            <Text style={styles.emptyText}>
              Essaie une autre recherche ou recharge la page.
            </Text>
          </View>
        ) : (
          filtered.map((job) => (
            <Pressable key={job.id} style={styles.card} onPress={() => openJob(job.id)}>
              <View style={styles.cardTop}>
                <View style={styles.badges}>
                  {job.premium ? (
                    <View style={[styles.pill, styles.pillPremium]}>
                      <Text style={styles.pillPremiumText}>Premium</Text>
                    </View>
                  ) : null}

                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{job.contractType}</Text>
                  </View>

                  {job.isPaid ? (
                    <View style={[styles.pill, styles.pillPaid]}>
                      <Text style={styles.pillPaidText}>Rémunéré</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.time}>{job.createdAtLabel}</Text>
              </View>

              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.company}>{job.company}</Text>

              <View style={styles.footerRow}>
                <View style={styles.domainRow}>
                  <Feather name="map-pin" size={14} color={theme.colors.faint} />
                  <Text style={styles.domain}>{job.city}</Text>
                </View>

                <View style={styles.domainRow}>
                  <Feather name="briefcase" size={14} color={theme.colors.faint} />
                  <Text style={styles.domain}>{job.domain}</Text>
                </View>

                <Feather name="chevron-right" size={18} color={theme.colors.faint} />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  container: { padding: 16, paddingBottom: 120 },
  hero: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.text,
  },
  heroSub: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.muted,
    lineHeight: 20,
  },
  searchWrap: {
    marginTop: 16,
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  chipActive: {
    backgroundColor: "#EAF2FF",
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  chipTextActive: {
    color: theme.colors.primary,
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: 24,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
  },
  emptyText: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: 16,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
    marginRight: 10,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  pillPremium: {
    backgroundColor: theme.colors.primary2,
    borderColor: "transparent",
  },
  pillPremiumText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  pillPaid: {
    backgroundColor: "rgba(16,185,129,0.10)",
    borderColor: "rgba(16,185,129,0.22)",
  },
  pillText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  pillPaidText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "900",
  },
  time: {
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "700",
  },
  jobTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
  },
  company: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  domain: {
    color: theme.colors.faint,
    fontSize: 12.5,
    fontWeight: "800",
  },
});