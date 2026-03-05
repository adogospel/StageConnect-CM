import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, RefreshControl } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { theme } from "../../constants/theme";
import { deleteJob, getMyCompanyJobs } from "../../src/services/jobs";

import { SafeAreaView } from "react-native-safe-area-context";

function daysAgoLabel(dateIso?: string) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Aujourd’hui";
  if (days === 1) return "Hier";
  return `Il y a ${days}j`;
}

export default function CompanyOffers() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyCompanyJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert("Erreur", e?.response?.data?.message || e?.message || "Impossible de charger tes offres.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await getMyCompanyJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert("Erreur", e?.response?.data?.message || e?.message || "Refresh impossible.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const count = useMemo(() => jobs.length, [jobs]);

  const openCandidates = (jobId: string) => {
    router.push(`/(company-tabs)/company-candidates/${jobId}` as any);
  };

  const confirmDelete = (jobId: string) => {
    Alert.alert("Désactiver l’offre ?", "L’offre ne sera plus visible publiquement.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Désactiver",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteJob(jobId);
            await load();
          } catch (e: any) {
            Alert.alert("Erreur", e?.response?.data?.message || e?.message || "Action impossible.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Mes offres</Text>
            <Text style={styles.sub}>
              {loading ? "Chargement…" : `${count} offre${count > 1 ? "s" : ""} publiée${count > 1 ? "s" : ""}.`}
            </Text>
          </View>

          <Pressable
            style={styles.addBtn}
            onPress={() => router.push("/(company-tabs)/company-offer-new" as any)}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.addText}>Publier</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.card}><Text style={styles.cardMuted}>Récupération…</Text></View>
        ) : jobs.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Aucune offre</Text>
            <Text style={styles.cardMuted}>Publie ta première offre pour recevoir des candidatures.</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {jobs.map((j) => (
              <View key={j._id} style={styles.jobCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle} numberOfLines={2}>{j.title}</Text>
                  <Text style={styles.jobMeta}>
                    {j.city} • {j.contractType} • {daysAgoLabel(j.createdAt)}
                  </Text>
                </View>

                <Pressable onPress={() => openCandidates(j._id)} style={styles.smallBtn}>
                  <Feather name="users" size={16} color={theme.colors.primary2} />
                </Pressable>

                <Pressable onPress={() => confirmDelete(j._id)} style={styles.smallBtn}>
                  <Feather name="trash-2" size={16} color={theme.colors.danger} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 26 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xxl, paddingBottom: theme.spacing.xxl },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.lg },
  title: { color: theme.colors.text, ...theme.text.h1 },
  sub: { color: theme.colors.muted, marginTop: 6, fontSize: 14, fontWeight: "700" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: theme.colors.primary2, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, ...theme.shadow.soft },
  addText: { color: "#fff", fontWeight: "900" },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.stroke, padding: theme.spacing.lg, ...theme.shadow.soft },
  cardTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "900" },
  cardMuted: { color: theme.colors.muted, marginTop: 6, fontWeight: "700", lineHeight: 20 },
  jobCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.stroke, padding: theme.spacing.lg, ...theme.shadow.soft },
  jobTitle: { color: theme.colors.text, fontSize: 14.5, fontWeight: "900" },
  jobMeta: { color: theme.colors.muted, marginTop: 6, fontWeight: "700", fontSize: 12.5 },
  smallBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: theme.colors.surface2, borderWidth: 1, borderColor: theme.colors.stroke, alignItems: "center", justifyContent: "center" },
});