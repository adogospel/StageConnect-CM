import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { theme } from "../../constants/theme";

export default function Profile() {
  const user = {
    name: "Adonai",
    role: "Étudiant",
    email: "adonai@gmail.com",
  };

  const go = (label: string) => Alert.alert(label, "Écran à venir 🙂");

  const logout = async () => {
    // plus tard: clear token + redirect login
    Alert.alert("Déconnexion", "Simulation ✅");
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.sub}>Gère ton compte et tes préférences.</Text>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Feather name="user" size={20} color={theme.colors.text} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {user.role} • {user.email}
            </Text>
          </View>

          <Pressable onPress={() => go("Modifier profil")} style={styles.editBtn}>
            <Feather name="edit-3" size={16} color={theme.colors.primary2} />
          </Pressable>
        </View>

        {/* Section 1 */}
        <Section title="Compte">
          <Row icon="user" label="Informations personnelles" onPress={() => go("Informations")} />
          <Row icon="file-text" label="Mon CV" onPress={() => go("Mon CV")} />
          <Row icon="lock" label="Sécurité" onPress={() => go("Sécurité")} />
        </Section>

        {/* Section 2 */}
        <Section title="Préférences">
          <Row icon="bell" label="Notifications" onPress={() => go("Notifications")} />
          <Row icon="map-pin" label="Ville & Domaines" onPress={() => go("Ville & Domaines")} />
          <Row icon="sliders" label="Filtres par défaut" onPress={() => go("Filtres")} />
        </Section>

        {/* Section 3 */}
        <Section title="Support">
          <Row icon="help-circle" label="Centre d’aide" onPress={() => go("Centre d’aide")} />
          <Row icon="message-circle" label="Nous contacter" onPress={() => go("Contact")} />
          <Row icon="shield" label="Confidentialité" onPress={() => go("Confidentialité")} />
        </Section>

        {/* Danger */}
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
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: theme.spacing.lg }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.rowIcon, danger ? styles.rowIconDanger : null]}>
        <Feather
          name={icon}
          size={16}
          color={danger ? theme.colors.danger : theme.colors.text}
        />
      </View>

      <Text style={[styles.rowLabel, danger ? { color: theme.colors.danger } : null]}>
        {label}
      </Text>

      <Feather name="chevron-right" size={18} color={theme.colors.faint} />
      <View style={styles.divider} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
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
    ...theme.shadow.soft,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: 4,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    color: theme.colors.faint,
    fontSize: 12.5,
    fontWeight: "900",
    marginBottom: 10,
    paddingLeft: 6,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    overflow: "hidden",
    ...theme.shadow.soft,
  },
  row: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconDanger: {
    backgroundColor: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.22)",
  },
  rowLabel: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14.5,
    fontWeight: "bold",
  },
  divider: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 0,
    height: 1,
    backgroundColor: theme.colors.stroke,
  },
  dangerCard: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.18)",
    overflow: "hidden",
    ...theme.shadow.soft,
  },
  footer: {
    marginTop: theme.spacing.lg,
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
});