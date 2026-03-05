import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, RefreshControl } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { theme } from "../../../constants/theme";
import { getApplicationsByJob, updateApplicationStatus } from "../../../src/services/applications";

export default function CompanyCandidates() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getApplicationsByJob(String(jobId));
      setApps(data?.applications ?? []);
    } catch (e: any) {
      Alert.alert("Erreur", e?.response?.data?.message || e?.message || "Impossible de charger les candidats.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { if (jobId) load(); }, [jobId, load]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getApplicationsByJob(String(jobId));
      setApps(data?.applications ?? []);
    } catch (e: any) {
      Alert.alert("Erreur", e?.response?.data?.message || e?.message || "Refresh impossible.");
    } finally {
      setRefreshing(false);
    }
  }, [jobId]);

  const setStatus = async (id: string, status: "accepted" | "rejected") => {
    try {
      await updateApplicationStatus(id, status);
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.response?.data?.message || e?.message || "Action impossible.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.card}><Text style={styles.muted}>Chargement…</Text></View>
        ) : apps.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Aucune candidature</Text>
            <Text style={styles.muted}>Reviens plus tard ou partage ton offre.</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {apps.map((a) => {
              const s = a?.student;
              return (
                <View key={a._id} style={styles.candCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                      {(s?.firstName || "—")} {(s?.lastName || "")}
                    </Text>
                    <Text style={styles.info}>
                      {(s?.university || "—")} • {(s?.fieldOfStudy || "—")} • {(s?.level || "—")}
                    </Text>
                    <Text style={styles.status}>Statut : {a.status}</Text>
                    {!!a.message && <Text style={styles.msg} numberOfLines={3}>“{a.message}”</Text>}
                  </View>

                  <View style={{ gap: 10 }}>
                    <Pressable onPress={() => setStatus(a._id, "accepted")} style={[styles.actionBtn, styles.accept]}>
                      <Feather name="check" size={16} color="#fff" />
                    </Pressable>
                    <Pressable onPress={() => setStatus(a._id, "rejected")} style={[styles.actionBtn, styles.reject]}>
                      <Feather name="x" size={16} color="#fff" />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 26 }} />
      </ScrollView>
    </View>
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
  topTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "900" },
  container: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.stroke, padding: theme.spacing.lg },
  cardTitle: { color: theme.colors.text, fontWeight: "900", fontSize: 15 },
  muted: { color: theme.colors.muted, marginTop: 6, fontWeight: "700" },
  candCard: { flexDirection: "row", gap: 12, backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.stroke, padding: theme.spacing.lg },
  name: { color: theme.colors.text, fontWeight: "900", fontSize: 14.5 },
  info: { color: theme.colors.muted, marginTop: 6, fontWeight: "700", fontSize: 12.5 },
  status: { color: theme.colors.faint, marginTop: 10, fontWeight: "900", fontSize: 12.5 },
  msg: { color: theme.colors.muted, marginTop: 10, fontWeight: "700", lineHeight: 18 },
  actionBtn: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  accept: { backgroundColor: theme.colors.success },
  reject: { backgroundColor: theme.colors.danger },
});