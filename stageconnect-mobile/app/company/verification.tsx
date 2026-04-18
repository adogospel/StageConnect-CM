import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadVerificationDocuments } from "../../src/services/company";

type LocalFile = {
  uri: string;
  name: string;
  mimeType?: string;
};

export default function CompanyVerificationScreen() {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [documentType, setDocumentType] = useState<
    "rccm" | "niu" | "taxpayer_card" | "other"
  >("rccm");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => files.length > 0 && !submitting, [files, submitting]);

  const onPickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
        type: ["application/pdf", "image/*"],
      });

      if (result.canceled) return;

      const picked = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || undefined,
      }));

      setFiles(picked);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sélectionner les documents.");
    }
  };

  const onSubmit = async () => {
    if (!files.length) {
      Alert.alert("Documents requis", "Ajoute au moins un document.");
      return;
    }

    try {
      setSubmitting(true);

      await uploadVerificationDocuments({
        files,
        documentType,
      });

      Alert.alert(
        "Documents envoyés",
        "Tes documents ont été envoyés à l’admin. Le statut est maintenant en attente."
      );

      setFiles([]);
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || "Impossible d’envoyer les documents."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const DocTypeButton = ({
    value,
    label,
  }: {
    value: "rccm" | "niu" | "taxpayer_card" | "other";
    label: string;
  }) => {
    const active = documentType === value;

    return (
      <Pressable
        onPress={() => setDocumentType(value)}
        style={[styles.typeChip, active && styles.typeChipActive]}
      >
        <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.iconWrap}>
            <Feather name="shield" size={22} color="#1D4ED8" />
          </View>

          <Text style={styles.title}>Vérification entreprise</Text>
          <Text style={styles.subtitle}>
            Envoie un document officiel pour prouver que ton entreprise est réelle.
            Après validation admin, tu pourras publier des offres.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de document</Text>

          <View style={styles.chipsRow}>
            <DocTypeButton value="rccm" label="RCCM" />
            <DocTypeButton value="niu" label="NIU" />
            <DocTypeButton value="taxpayer_card" label="Fiscal" />
            <DocTypeButton value="other" label="Autre" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents</Text>

          <Pressable style={styles.pickButton} onPress={onPickFiles}>
            <Feather name="upload-cloud" size={18} color="#0F172A" />
            <Text style={styles.pickButtonText}>Choisir les fichiers</Text>
          </Pressable>

          <View style={styles.fileList}>
            {files.length === 0 ? (
              <Text style={styles.emptyText}>
                Aucun fichier sélectionné pour l’instant.
              </Text>
            ) : (
              files.map((file, index) => (
                <View key={`${file.name}-${index}`} style={styles.fileItem}>
                  <Feather name="file-text" size={16} color="#2563EB" />
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Documents conseillés</Text>
          <Text style={styles.noticeText}>• RCCM</Text>
          <Text style={styles.noticeText}>• NIU / Attestation fiscale</Text>
          <Text style={styles.noticeText}>• Document de localisation ou justificatif</Text>
        </View>

        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={onSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="send" size={18} color="#fff" />
              <Text style={styles.submitButtonText}>Envoyer pour validation</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 18,
    paddingBottom: 32,
    gap: 18,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
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
    fontSize: 14,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },
  typeChipActive: {
    backgroundColor: "#DBEAFE",
  },
  typeChipText: {
    fontWeight: "700",
    color: "#334155",
  },
  typeChipTextActive: {
    color: "#1D4ED8",
  },
  pickButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  pickButtonText: {
    fontWeight: "800",
    color: "#0F172A",
  },
  fileList: {
    marginTop: 14,
    gap: 10,
  },
  emptyText: {
    color: "#64748B",
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
  },
  fileName: {
    flex: 1,
    color: "#0F172A",
    fontWeight: "600",
  },
  noticeCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  noticeTitle: {
    fontWeight: "900",
    color: "#9A3412",
    marginBottom: 8,
  },
  noticeText: {
    color: "#7C2D12",
    lineHeight: 22,
  },
  submitButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
});