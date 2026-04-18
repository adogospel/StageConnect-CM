import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  getCompanyReviewDetails,
  approveCompany,
  rejectCompany,
} from "../../../src/services/admin";

export default function AdminCompanyDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState("");
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;

    try {
      const data = await getCompanyReviewDetails(id);
      setCompany(data);
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || "Impossible de charger le dossier."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const openDoc = async (fileUrl: string) => {
    if (!fileUrl) return;
    try {
      const base = "http://192.168.100.238:5000";
      await Linking.openURL(`${base}${fileUrl}`);
    } catch {
      Alert.alert("Erreur", "Impossible d’ouvrir ce document.");
    }
  };

  const onApprove = async () => {
    if (!id) return;

    try {
      setActing(true);
      await approveCompany(id);
      Alert.alert("Succès", "Entreprise approuvée.");
      await load();
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || "Impossible d’approuver."
      );
    } finally {
      setActing(false);
    }
  };

  const onReject = async () => {
    if (!id) return;

    if (!reason.trim()) {
      Alert.alert("Motif requis", "Ajoute le motif du rejet.");
      return;
    }

    try {
      setActing(true);
      await rejectCompany(id, reason.trim());
      Alert.alert("Succès", "Entreprise rejetée.");
      await load();
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || "Impossible de rejeter."
      );
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (!company) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loaderWrap}>
          <Text>Dossier introuvable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color="#0F172A" />
          <Text style={styles.backButtonText}>Retour</Text>
        </Pressable>

        <View style={styles.headerCard}>
          <Text style={styles.title}>{company.companyName}</Text>
          <Text style={styles.meta}>{company.city} • {company.sector}</Text>
          <Text style={styles.meta}>{company.user?.email || "Email indisponible"}</Text>
          <Text style={styles.statusText}>
            Statut : {company.verificationStatus}
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Description</Text>
          <Text style={styles.blockText}>
            {company.description || "Aucune description fournie."}
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Documents envoyés</Text>

          {!company.verificationDocs || company.verificationDocs.length === 0 ? (
            <Text style={styles.blockText}>Aucun document trouvé.</Text>
          ) : (
            company.verificationDocs.map((doc: any, index: number) => (
              <Pressable
                key={doc._id || index}
                style={styles.docCard}
                onPress={() => openDoc(doc.fileUrl)}
              >
                <View style={styles.docLeft}>
                  <Feather name="file-text" size={18} color="#2563EB" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docName} numberOfLines={1}>
                      {doc.originalName}
                    </Text>
                    <Text style={styles.docMeta}>
                      {doc.documentType || "other"}
                    </Text>
                  </View>
                </View>
                <Feather name="external-link" size={18} color="#94A3B8" />
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Rejeter avec motif</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Ex: document flou, informations insuffisantes..."
            multiline
            style={styles.input}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={onApprove}
            disabled={acting}
          >
            {acting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="check" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Approuver</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={onReject}
            disabled={acting}
          >
            {acting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="x" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Rejeter</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 18, gap: 16, paddingBottom: 34 },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  backButtonText: {
    fontWeight: "800",
    color: "#0F172A",
  },
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
  meta: {
    marginTop: 6,
    color: "#64748B",
  },
  statusText: {
    marginTop: 10,
    color: "#0F172A",
    fontWeight: "800",
  },
  block: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 10,
  },
  blockText: {
    color: "#475569",
    lineHeight: 22,
  },
  docCard: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  docLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  docName: {
    fontWeight: "800",
    color: "#0F172A",
  },
  docMeta: {
    color: "#64748B",
    marginTop: 2,
  },
  input: {
    minHeight: 120,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: "#0F172A",
  },
  actions: {
    gap: 12,
  },
  actionBtn: {
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  approveBtn: {
    backgroundColor: "#16A34A",
  },
  rejectBtn: {
    backgroundColor: "#DC2626",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
});