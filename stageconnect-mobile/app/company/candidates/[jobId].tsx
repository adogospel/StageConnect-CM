import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { theme } from "../../../constants/theme";
import {
  createCompanyProfile,
  getMyCompanyProfile,
  updateCompanyProfile,
} from "../../../src/services/company";

export default function EditCompanyProfileScreen() {
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyCompanyProfile();
        setHasProfile(true);
        setCompanyName(data?.companyName || "");
        setSector(data?.sector || "");
        setCity(data?.city || "");
        setAddress(data?.address || "");
        setPhone(data?.phone || "");
        setLogoUrl(data?.logoUrl || "");
        setDescription(data?.description || "");
      } catch {
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const canSubmit = useMemo(() => {
    return (
      companyName.trim().length >= 2 &&
      sector.trim().length >= 2 &&
      city.trim().length >= 2 &&
      phone.trim().length >= 6
    );
  }, [companyName, sector, city, phone]);

  const onSave = async () => {
    if (!canSubmit) {
      return Alert.alert(
        "Profil incomplet",
        "Renseigne le nom de l’entreprise, le secteur, la ville et le téléphone."
      );
    }

    const payload = {
      companyName: companyName.trim(),
      sector: sector.trim(),
      city: city.trim(),
      address: address.trim(),
      phone: phone.trim(),
      logoUrl: logoUrl.trim(),
      description: description.trim(),
    };

    try {
      setSaving(true);

      if (hasProfile) {
        await updateCompanyProfile(payload);
      } else {
        await createCompanyProfile(payload);
      }

      Alert.alert(
        "Succès",
        hasProfile
          ? "Profil entreprise mis à jour."
          : "Profil entreprise créé."
      );

      router.replace("/(company-tabs)/home");
    } catch (e: any) {
      Alert.alert(
        "Erreur",
        e?.response?.data?.message || "Impossible d’enregistrer le profil."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: theme.colors.muted }}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={18} color={theme.colors.text} />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                {hasProfile ? "Modifier le profil" : "Créer le profil"}
              </Text>
              <Text style={styles.sub}>
                Remplis les informations clés de l’entreprise.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Input
              label="Nom de l’entreprise"
              icon="briefcase"
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Ex: StillForce Technologies"
            />

            <Input
              label="Secteur"
              icon="layers"
              value={sector}
              onChangeText={setSector}
              placeholder="Ex: Informatique / Transport / Finance"
            />

            <Input
              label="Ville"
              icon="map-pin"
              value={city}
              onChangeText={setCity}
              placeholder="Ex: Douala"
            />

            <Input
              label="Adresse"
              icon="navigation"
              value={address}
              onChangeText={setAddress}
              placeholder="Ex: Bonapriso, Douala"
            />

            <Input
              label="Téléphone"
              icon="phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Ex: 6XXXXXXXX"
              keyboardType="phone-pad"
            />

            <Input
              label="Logo URL (optionnel)"
              icon="image"
              value={logoUrl}
              onChangeText={setLogoUrl}
              placeholder="https://..."
            />

            <Input
              label="Description (optionnel)"
              icon="align-left"
              value={description}
              onChangeText={setDescription}
              placeholder="Présente brièvement l’entreprise..."
              multiline
              inputStyle={styles.multiline}
            />

            <Button
              title={saving ? "Enregistrement..." : hasProfile ? "Mettre à jour" : "Créer le profil"}
              onPress={onSave}
              loading={saving}
              disabled={!canSubmit || saving}
              style={{ marginTop: 8 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    padding: 18,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  sub: {
    marginTop: 6,
    color: theme.colors.muted,
    lineHeight: 20,
    fontWeight: "600",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: 18,
    gap: 12,
    ...theme.shadow.soft,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
    paddingTop: 14,
  },
});