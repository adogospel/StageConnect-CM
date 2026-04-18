import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { theme } from "../../constants/theme";

// ✅ Backend
import { getMyApplications } from "../../src/services/applications";

type Status = "pending" | "accepted" | "rejected";

type ApplicationItem = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  city: string;
  status: Status;
  appliedAtLabel: string;
  lastUpdateLabel: string;
};

// --- helpers ---
function timeAgoLabel(dateIso?: string) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 1) return "À l’instant";
  if (mins < 60) return `Aujourd’hui • ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Aujourd’hui • ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  return `Il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
}

function statusLabel(status: Status) {
  if (status === "accepted") return "Acceptée • Bravo 🎉";
  if (status === "rejected") return "Refusée • Continue 🙏";
  return "En attente de réponse";
}

function normalizeApplications(apiApps: any[]): ApplicationItem[] {
  return (apiApps || []).map((a: any) => {
    const job = a?.jobOffer;
    const company = job?.company?.companyName || "Entreprise";
    const city = job?.city || job?.company?.city || "—";
    const st: Status = a?.status || "pending";

    return {
      id: a?._id,
      jobId: job?._id,
      jobTitle: job?.title || "Offre",
      company,
      city,
      status: st,
      appliedAtLabel: timeAgoLabel(a?.appliedAt || a?.createdAt),
      lastUpdateLabel: statusLabel(st),
    };
  });
}

export default function Applications() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [apps, setApps] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyApplications();
      // backend: { success, count, applications }
      const list = data?.applications ?? [];
      setApps(normalizeApplications(list));
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || e?.message || "Impossible de charger tes candidatures."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getMyApplications();
      const list = data?.applications ?? [];
      setApps(normalizeApplications(list));
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || e?.message || "Refresh impossible."
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  const data = useMemo(() => {
    if (filter === "all") return apps;
    return apps.filter((a) => a.status === filter);
  }, [filter, apps]);

  const openJob = (jobId: string) => {
    if (!jobId) return;
    router.push(`/student/job/${jobId}` as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Candidatures</Text>
              <Text style={styles.sub}>Suis tes demandes et leurs statuts en temps réel.</Text>
            </View>

            <Pressable
              style={styles.infoBtn}
              onPress={() => Alert.alert("Astuce", "Tire vers le bas pour actualiser 👇")}
            >
              <Feather name="info" size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          {/* Filters */}
          <View style={styles.filtersRow}>
            <Chip active={filter === "all"} label="Tout" onPress={() => setFilter("all")} />
            <Chip
              active={filter === "pending"}
              label="En attente"
              tone="pending"
              onPress={() => setFilter("pending")}
            />
            <Chip
              active={filter === "accepted"}
              label="Acceptées"
              tone="accepted"
              onPress={() => setFilter("accepted")}
            />
            <Chip
              active={filter === "rejected"}
              label="Refusées"
              tone="rejected"
              onPress={() => setFilter("rejected")}
            />
          </View>

          <View style={styles.countRow}>
            <Text style={styles.countText}>
              {loading ? "Chargement…" : `${data.length} candidature${data.length > 1 ? "s" : ""}`}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          {loading ? (
            <View style={{ paddingVertical: 16 }}>
              <Text style={{ color: theme.colors.muted, fontWeight: "700", textAlign: "center" }}>
                Récupération des candidatures…
              </Text>
            </View>
          ) : data.length === 0 ? (
            <View style={{ paddingVertical: 16 }}>
              <Text style={{ color: theme.colors.muted, fontWeight: "700", textAlign: "center" }}>
                Aucune candidature dans ce filtre.
              </Text>
            </View>
          ) : (
            data.map((item, idx) => (
              <TimelineItem
                key={item.id}
                item={item}
                isLast={idx === data.length - 1}
                onOpen={() => openJob(item.jobId)}
              />
            ))
          )}
        </View>

        <View style={{ height: 26 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TimelineItem({
  item,
  isLast,
  onOpen,
}: {
  item: ApplicationItem;
  isLast: boolean;
  onOpen: () => void;
}) {
  const tone = getTone(item.status);

  return (
    <View style={styles.itemRow}>
      {/* left rail */}
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: tone.dot }]} />
        {!isLast && <View style={styles.line} />}
      </View>

      {/* content */}
      <View style={styles.itemContent}>
        <View style={styles.itemTop}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.jobTitle}
          </Text>
          <StatusPill status={item.status} />
        </View>

        <Text style={styles.itemCompany}>
          {item.company} • <Text style={styles.city}>{item.city}</Text>
        </Text>

        <View style={styles.metaRow}>
          <Meta icon="send" text={`Postulé : ${item.appliedAtLabel}`} />
          <Meta icon="refresh-cw" text={item.lastUpdateLabel} />
        </View>

        <Pressable onPress={onOpen} style={styles.openBtn}>
          <Text style={styles.openText}>Voir l’offre</Text>
          <Feather name="chevron-right" size={18} color={theme.colors.primary2} />
        </Pressable>
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: Status }) {
  const t = getTone(status);
  const label =
    status === "pending" ? "En attente" : status === "accepted" ? "Acceptée" : "Refusée";

  return (
    <View style={[styles.statusPill, { backgroundColor: t.bg, borderColor: t.border }]}>
      <Text style={[styles.statusText, { color: t.text }]}>{label}</Text>
    </View>
  );
}

function Meta({ icon, text }: { icon: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={styles.meta}>
      <Feather name={icon} size={14} color={theme.colors.faint} />
      <Text style={styles.metaText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function Chip({
  active,
  label,
  onPress,
  tone,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  tone?: Status;
}) {
  const colors = tone ? getTone(tone) : null;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active ? styles.chipActive : null,
        active && colors ? { backgroundColor: colors.dot, borderColor: "transparent" } : null,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          active ? styles.chipTextActive : null,
          active && colors ? { color: "#fff" } : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getTone(status: Status) {
  if (status === "accepted") {
    return {
      dot: theme.colors.success,
      bg: "rgba(16,185,129,0.10)",
      border: "rgba(16,185,129,0.22)",
      text: theme.colors.success,
    };
  }
  if (status === "rejected") {
    return {
      dot: theme.colors.danger,
      bg: "rgba(239,68,68,0.10)",
      border: "rgba(239,68,68,0.22)",
      text: theme.colors.danger,
    };
  }
  return {
    dot: theme.colors.warning,
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.22)",
    text: theme.colors.warning,
  };
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    ...theme.text.h1,
  },
  sub: {
    color: theme.colors.muted,
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    maxWidth: 320,
  },
  infoBtn: {
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
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  chip: {
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
    fontWeight: "900",
  },
  chipTextActive: {
    color: "#fff",
  },
  countRow: {
    marginTop: 12,
  },
  countText: {
    color: theme.colors.faint,
    fontSize: 12.5,
    fontWeight: "900",
  },
  timelineCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
    ...theme.shadow.soft,
  },
  itemRow: {
    flexDirection: "row",
    gap: 12,
  },
  rail: {
    width: 18,
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    marginTop: 6,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: "rgba(15,23,42,0.10)",
    marginTop: 6,
    marginBottom: 6,
    borderRadius: 99,
  },
  itemContent: {
    flex: 1,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stroke,
    marginBottom: 18,
  },
  itemTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  itemTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15.5,
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  itemCompany: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },
  city: {
    color: theme.colors.text,
    fontWeight: "900",
  },
  metaRow: {
    marginTop: 12,
    gap: 10,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "100%",
  },
  metaText: {
    color: theme.colors.faint,
    fontSize: 12.5,
    fontWeight: "800",
  },
  openBtn: {
    marginTop: 14,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  openText: {
    color: theme.colors.primary2,
    fontSize: 13,
    fontWeight: "bold",
  },
});