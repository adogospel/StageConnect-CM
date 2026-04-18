import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../../constants/theme";

// 👉 à connecter Phase 2
// import { getMe } from "../../src/services/auth";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // ⚠️ TEMPORAIRE (Phase 2 → backend réel)
      const fakeUser = {
        firstName: "Adonai",
        lastName: "",
        role: "Étudiant",
        email: "adonai@gmail.com",
      };

      setUser(fakeUser);

      // 🔥 Phase 2 :
      // const data = await getMe();
      // setUser(data);

    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

  const go = (label: string) => Alert.alert(label, "Écran à venir 🙂");

  const logout = async () => {
    Alert.alert("Déconnexion", "Simulation ✅");
    router.replace("/(auth)/login");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Impossible de charger le profil</Text>
      </SafeAreaView>
    );
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.sub}>
          Gère ton compte et tes préférences.
        </Text>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Feather name="user" size={20} color={theme.colors.text} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {fullName || "Utilisateur"}
            </Text>

            <Text style={styles.meta} numberOfLines={1}>
              {user.role} • {user.email}
            </Text>
          </View>

          <Pressable
            onPress={() => go("Modifier profil")}
            style={styles.editBtn}
          >
            <Feather
              name="edit-3"
              size={16}
              color={theme.colors.primary2}
            />
          </Pressable>
        </View>

        {/* COMPTE */}
        <Section title="Compte">
          <Row icon="user" label="Informations personnelles" onPress={() => go("Infos")} />
          <Row icon="file-text" label="Mon CV" onPress={() => go("CV")} />
          <Row icon="lock" label="Sécurité" onPress={() => go("Sécurité")} />
        </Section>

        {/* PRÉFÉRENCES */}
        <Section title="Préférences">
          <Row icon="bell" label="Notifications" onPress={() => go("Notif")} />
          <Row icon="map-pin" label="Ville & Domaines" onPress={() => go("Ville")} />
          <Row icon="sliders" label="Filtres par défaut" onPress={() => go("Filtres")} />
        </Section>

        {/* SUPPORT */}
        <Section title="Support">
          <Row icon="help-circle" label="Centre d’aide" onPress={() => go("Help")} />
          <Row icon="message-circle" label="Nous contacter" onPress={() => go("Contact")} />
          <Row icon="shield" label="Confidentialité" onPress={() => go("Confidentialité")} />
        </Section>

        {/* LOGOUT */}
        <View style={styles.dangerCard}>
          <Row
            icon="log-out"
            label="Se déconnecter"
            danger
            onPress={logout}
          />
        </View>

        <Text style={styles.footer}>
          StageConnect CM • Version 1.0
        </Text>

        <View style={{ height: 26 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- COMPONENTS ---------- */

function Section({ title, children }: any) {
  return (
    <View style={{ marginTop: theme.spacing.lg }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Row({ icon, label, onPress, danger }: any) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Feather
          name={icon}
          size={16}
          color={danger ? theme.colors.danger : theme.colors.text}
        />
      </View>

      <Text
        style={[
          styles.rowLabel,
          danger && { color: theme.colors.danger },
        ]}
      >
        {label}
      </Text>

      <Feather
        name="chevron-right"
        size={18}
        color={theme.colors.faint}
      />

      <View style={styles.divider} />
    </Pressable>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },

  profileCard: {
    marginTop: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },

  name: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },

  meta: {
    color: theme.colors.muted,
    fontSize: 12.5,
    marginTop: 4,
  },

  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 10,
  },

  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },

  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  rowIconDanger: {
    backgroundColor: "rgba(239,68,68,0.1)",
  },

  rowLabel: {
    flex: 1,
    marginLeft: 10,
    fontWeight: "600",
  },

  divider: {
    position: "absolute",
    bottom: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: theme.colors.stroke,
  },

  dangerCard: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },

  footer: {
    marginTop: theme.spacing.lg,
    textAlign: "center",
    fontSize: 12,
    color: theme.colors.faint,
  },
});