import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { theme } from "../../constants/theme";
import JobCard, { Job } from "../../components/JobCard";

// ✅ Backend
import { getJobs } from "../../src/services/jobs";

type ChipKey = "all" | "city" | "domain" | "paid";

// --- helpers (petits, sans lib) ---
function daysAgoLabel(dateIso?: string) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Aujourd’hui";
  if (days === 1) return "Hier";
  return `${days}j`;
}

function normalizeJobs(apiJobs: any[]): Job[] {
  return (apiJobs || []).map((j: any) => {
    const companyName = j?.company?.companyName || "Entreprise";
    const city = j?.city || j?.company?.city || "—";

    // ⚠️ IMPORTANT : JobCard attend "premium" (ton fake data),
    // mais ton backend renvoie "isPremium".
    // On mappe donc isPremium -> premium.
    const premium = !!j?.isPremium;

    return {
      id: j?._id, // JobCard utilise id
      title: j?.title || "Offre",
      company: companyName,
      city,
      contractType: j?.contractType || "—",
      isPaid: !!j?.isPaid,
      domain: j?.domain || "—",
      premium,
      createdAtLabel: daysAgoLabel(j?.createdAt),
    };
  });
}

export default function Jobs() {
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<ChipKey>("all");

  // ✅ data backend
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getJobs();

      // Ton backend renvoie un ARRAY direct ✅
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

  const topJobs = useMemo(() => jobs.filter((j) => j.premium).slice(0, 6), [jobs]);

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
        (chip === "city" && (j.city === "Yaoundé" || j.city === "Douala")) ||
        (chip === "domain" &&
          (j.domain.toLowerCase().includes("informat") ||
            j.domain.toLowerCase().includes("dev") ||
            j.domain.toLowerCase().includes("tech")));

      return matchQuery && matchChip;
    });
  }, [jobs, q, chip]);

  const openJob = (id: string) => {
    router.push(`/(student-tabs)/job/${id}` as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.headerWrap}>
          <LinearGradient
            colors={["rgba(59,130,246,0.14)", "rgba(99,102,241,0.08)", "rgba(255,255,255,0)"]}
            style={styles.headerGlow}
          />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.hi}>Offres</Text>
              <Text style={styles.sub}>Découvre des opportunités adaptées à toi.</Text>
            </View>

            <Pressable style={styles.avatar}>
              <Feather name="user" size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Feather name="search" size={18} color={theme.colors.faint} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Rechercher : React, Douala, UI/UX..."
              placeholderTextColor={theme.colors.faint}
              style={styles.searchInput}
            />
            {!!q && (
              <Pressable onPress={() => setQ("")} hitSlop={10}>
                <Feather name="x" size={18} color={theme.colors.faint} />
              </Pressable>
            )}
          </View>

          {/* Chips */}
          <View style={styles.chipsRow}>
            <Chip active={chip === "all"} label="Tout" onPress={() => setChip("all")} />
            <Chip
              active={chip === "paid"}
              label="Payé"
              icon="dollar-sign"
              onPress={() => setChip("paid")}
            />
            <Chip
              active={chip === "city"}
              label="Grandes villes"
              icon="map-pin"
              onPress={() => setChip("city")}
            />
            <Chip active={chip === "domain"} label="Tech" icon="cpu" onPress={() => setChip("domain")} />
          </View>
        </View>

        {/* Loading / empty */}
        {loading ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>Chargement…</Text>
            <Text style={styles.stateText}>On récupère les offres depuis l’API.</Text>
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateTitle}>Aucune offre</Text>
            <Text style={styles.stateText}>Reviens plus tard ou actualise la page.</Text>
          </View>
        ) : (
          <>
            {/* Section: Top offres */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Top offres</Text>
              <Pressable onPress={() => setChip("all")}>
                <Text style={styles.sectionLink}>Voir tout</Text>
              </Pressable>
            </View>

            <FlatList
              data={topJobs}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <JobCard job={item} variant="horizontal" onPress={() => openJob(item.id)} />
              )}
              contentContainerStyle={{ paddingLeft: theme.spacing.lg, paddingRight: theme.spacing.lg }}
              style={{ marginHorizontal: -theme.spacing.lg }}
              ListEmptyComponent={
                <View style={{ paddingHorizontal: theme.spacing.lg }}>
                  <Text style={styles.emptyTop}>Pas d’offres premium pour le moment.</Text>
                </View>
              }
            />

            {/* Section: Toutes les offres */}
            <View style={[styles.sectionRow, { marginTop: theme.spacing.xl }]}>
              <Text style={styles.sectionTitle}>Toutes les offres</Text>
              <Text style={styles.count}>{filtered.length}</Text>
            </View>

            <View style={{ gap: 12 }}>
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} onPress={() => openJob(job.id)} />
              ))}
            </View>

            <View style={{ height: 26 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : null]}>
      {!!icon && (
        <Feather name={icon} size={14} color={active ? "#fff" : theme.colors.faint} />
      )}
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  headerWrap: {
    position: "relative",
    marginBottom: theme.spacing.xl,
  },
  headerGlow: {
    position: "absolute",
    top: -40,
    left: -24,
    right: -24,
    height: 240,
    borderRadius: theme.radius.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  hi: {
    color: theme.colors.text,
    ...theme.text.h1,
  },
  sub: {
    color: theme.colors.muted,
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    maxWidth: 300,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.soft,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: theme.radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...theme.shadow.soft,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14.5,
    fontWeight: "700",
    paddingVertical: 0,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: theme.spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: "transparent",
  },
  chipText: {
    color: theme.colors.faint,
    fontSize: 12.5,
    fontWeight: "800",
  },
  chipTextActive: {
    color: "#fff",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    color: theme.colors.text,
    ...theme.text.h2,
  },
  sectionLink: {
    color: theme.colors.primary2,
    fontSize: 13,
    fontWeight: "900",
  },
  count: {
    color: theme.colors.faint,
    fontSize: 13,
    fontWeight: "900",
  },
  stateBox: {
    marginTop: 4,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadow.soft,
  },
  stateTitle: {
    color: theme.colors.text,
    fontSize: 14.5,
    fontWeight: "900",
  },
  stateText: {
    color: theme.colors.muted,
    marginTop: 6,
    fontSize: 13.5,
    fontWeight: "700",
    lineHeight: 19,
  },
  emptyTop: {
    color: theme.colors.faint,
    fontSize: 13,
    fontWeight: "800",
    paddingVertical: 10,
  },
});