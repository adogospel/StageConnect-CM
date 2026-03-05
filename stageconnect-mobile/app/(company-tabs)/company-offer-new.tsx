import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { theme } from "../../constants/theme";
import { createJob } from "../../src/services/jobs";

export default function CompanyOfferNew() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [domain, setDomain] = useState("");
  const [contractType, setContractType] = useState<"Stage académique" | "Stage pro" | "Job étudiant" | "Alternance">("Stage pro");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title || !description || !city || !domain || !contractType) {
      return Alert.alert("Champs requis", "Remplis au moins titre, description, ville, domaine, type de contrat.");
    }

    try {
      setLoading(true);
      await createJob({ title, description, city, domain, contractType });
      Alert.alert("Offre publiée ✅", "Ton offre est maintenant visible.");
      router.replace("/(tabs)/company-offers" as any);
    } catch (e: any) {
      Alert.alert("Erreur", e?.response?.data?.message || e?.message || "Impossible de publier.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Publier une offre</Text>
        <Text style={styles.sub}>Crée une offre rapidement (v1). On améliorera le formulaire ensuite.</Text>

        <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Ex: Stage Dev React" />
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Décris les missions, outils, profil..."
          multiline
          height={120}
        />
        <Field label="Ville" value={city} onChangeText={setCity} placeholder="Ex: Douala" />
        <Field label="Domaine" value={domain} onChangeText={setDomain} placeholder="Ex: Développement Web" />

        <Text style={styles.label}>Type de contrat</Text>
        <View style={styles.row}>
          {(["Stage académique", "Stage pro", "Job étudiant", "Alternance"] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => setContractType(t)}
              style={[styles.chip, contractType === t ? styles.chipActive : null]}
            >
              <Text style={[styles.chipText, contractType === t ? styles.chipTextActive : null]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={submit} disabled={loading} style={[styles.btn, loading ? { opacity: 0.7 } : null]}>
          <Text style={styles.btnText}>{loading ? "Publication..." : "Publier"}</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.linkBtn}>
          <Text style={styles.link}>Retour</Text>
        </Pressable>

        <View style={{ height: 26 }} />
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  height,
}: any) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.faint}
        multiline={!!multiline}
        style={[
          styles.input,
          multiline ? { height: height || 110, textAlignVertical: "top", paddingTop: 12 } : null,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xxl, paddingBottom: theme.spacing.xxl },
  title: { color: theme.colors.text, ...theme.text.h1 },
  sub: { color: theme.colors.muted, marginTop: 6, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  label: { color: theme.colors.faint, fontSize: 12.5, fontWeight: "900", marginTop: 8 },
  input: { marginTop: 8, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.stroke, borderRadius: theme.radius.xl, paddingHorizontal: 14, paddingVertical: 12, color: theme.colors.text, fontWeight: "700" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.stroke },
  chipActive: { backgroundColor: theme.colors.primary2, borderColor: "transparent" },
  chipText: { color: theme.colors.faint, fontWeight: "900", fontSize: 12.5 },
  chipTextActive: { color: "#fff" },
  btn: { marginTop: 18, height: 52, borderRadius: theme.radius.xl, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center", ...theme.shadow.soft },
  btnText: { color: "#fff", fontWeight: "900" },
  linkBtn: { marginTop: 12, alignItems: "center" },
  link: { color: theme.colors.primary2, fontWeight: "900" },
});