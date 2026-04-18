import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { getCompaniesForReview } from "../../src/services/admin";

type CompanyItem = {
  _id: string;
  companyName: string;
  city: string;
  sector: string;
  verificationStatus: string;
  verificationDocs?: any[];
  user?: {
    email?: string;
  };
};

export default function AdminCompaniesScreen() {
  const [items, setItems] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getCompaniesForReview("pending");
      setItems(data?.companies || []);
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || "Impossible de charger les entreprises."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>Entreprises en attente</Text>
          <Text style={styles.subtitle}>
            Vérifie les documents envoyés avant d’autoriser la publication des offres.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="inbox" size={22} color="#64748B" />
            <Text style={styles.emptyTitle}>Aucune demande en attente</Text>
            <Text style={styles.emptyText}>
              Les nouvelles entreprises apparaîtront ici dès qu’elles enverront leurs documents.
            </Text>
          </View>
        ) : (
          items.map((company) => (
            <Pressable
              key={company._id}
              style={styles.companyCard}
              onPress={() =>
                router.push(`/(admin-tabs)/company/${company._id}` as any)
              }
            >
              <View style={styles.companyTop}>
                <View style={styles.companyBadge}>
                  <Feather name="briefcase" size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.companyName}>{company.companyName}</Text>
                  <Text style={styles.companyMeta}>
                    {company.city} • {company.sector}
                  </Text>
                  <Text style={styles.companyMeta}>
                    {company.user?.email || "Email indisponible"}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#94A3B8" />
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.pendingChip}>
                  <Text style={styles.pendingChipText}>En attente</Text>
                </View>
                <Text style={styles.docsCount}>
                  {company.verificationDocs?.length || 0} document(s)
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 18, gap: 16, paddingBottom: 32 },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 8,
    color: "#475569",
    lineHeight: 22,
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: {
    fontWeight: "900",
    color: "#0F172A",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#64748B",
    lineHeight: 22,
  },
  companyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  companyTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  companyBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  companyMeta: {
    marginTop: 3,
    color: "#64748B",
  },
  bottomRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingChip: {
    backgroundColor: "#FFF7ED",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pendingChipText: {
    color: "#C2410C",
    fontWeight: "800",
  },
  docsCount: {
    color: "#475569",
    fontWeight: "700",
  },
});