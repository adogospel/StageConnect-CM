import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../../constants/theme";
import { getMyCompanyProfile } from "../../src/services/company";
import { getCurrentUser, logout } from "../../src/services/auth";

type CompanyProfileType = {
  _id: string;
  companyName: string;
  sector: string;
  city: string;
  address?: string;
  phone: string;
  logoUrl?: string;
  description?: string;
  isVerified: boolean;
  verificationStatus: "not_submitted" | "pending" | "verified" | "rejected";
  verificationNote?: string;
};

type CurrentUserType = {
  _id: string;
  email: string;
  role: "company" | "student" | "admin";
};

export default function Profile() {
  const [user, setUser] = useState<CurrentUserType | null>(null);
  const [profile, setProfile] = useState<CompanyProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [currentUser, companyProfile] = await Promise.all([
        getCurrentUser(),
        getMyCompanyProfile().catch(() => null),
      ]);

      setUser(currentUser);
      setProfile(companyProfile);
    } catch (error) {
      setUser(null);
      setProfile(null);
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

  const verificationState = useMemo(() => {
    if (!profile) return null;

    if (profile.isVerified && profile.verificationStatus === "verified") {
      return {
        tone: "success" as const,
        title: "Entreprise vérifiée",
        message:
          "Ton entreprise est validée. Tu peux publier librement des offres.",
        icon: "check-circle",
      };
    }

    if (profile.verificationStatus === "pending") {
      return {
        tone: "warning" as const,
        title: "Validation en attente",
        message:
          "Tes documents ont été envoyés et sont en cours de vérification par l’admin.",
        icon: "clock",
      };
    }

    if (profile.verificationStatus === "rejected") {
      return {
        tone: "danger" as const,
        title: "Validation rejetée",
        message:
          profile.verificationNote ||
          "Le dossier a été rejeté. Merci de corriger puis renvoyer les documents.",
        icon: "x-circle",
      };
    }

    return {
      tone: "neutral" as const,
      title: "Vérification non envoyée",
      message:
        "Tu dois encore envoyer les documents officiels de l’entreprise.",
      icon: "shield",
    };
  }, [profile]);

  const badgeStyles = (tone: "success" | "warning" | "danger" | "neutral") => {
    switch (tone) {
      case "success":
        return {
          wrap: {
            backgroundColor: "#ECFDF3",
            borderColor: "#BBF7D0",
          },
          iconBg: {
            backgroundColor: "#D1FAE5",
          },
          title: { color: "#166534" },
          text: { color: "#166534" },
        };
      case "warning":
        return {
          wrap: {
            backgroundColor: "#FFF7ED",
            borderColor: "#FED7AA",
          },
          iconBg: {
            backgroundColor: "#FFEDD5",
          },
          title: { color: "#9A3412" },
          text: { color: "#9A3412" },
        };
      case "danger":
        return {
          wrap: {
            backgroundColor: "#FEF2F2",
            borderColor: "#FECACA",
          },
          iconBg: {
            backgroundColor: "#FEE2E2",
          },
          title: { color: "#991B1B" },
          text: { color: "#991B1B" },
        };
      default:
        return {
          wrap: {
            backgroundColor: "#F8FAFC",
            borderColor: "#E2E8F0",
          },
          iconBg: {
            backgroundColor: "#E2E8F0",
          },
          title: { color: "#0F172A" },
          text: { color: "#475569" },
        };
    }
  };

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Veux-tu vraiment te déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Oui",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const goIfProfileExists = (path: any) => {
    if (!profile) {
      return router.push("/company/edit-profile" as any);
    }
    router.push(path);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const tone = verificationState?.tone || "neutral";
  const currentBadge = badgeStyles(tone);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Profil entreprise</Text>
        <Text style={styles.sub}>
          Gère ton compte, l’état de vérification et les informations de ton entreprise.
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Feather name="briefcase" size={20} color={theme.colors.text} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {profile?.companyName || "Profil entreprise non créé"}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {profile?.sector || "Entreprise"} • {user?.email || "Email indisponible"}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/company/edit-profile" as any)}
            style={styles.editBtn}
          >
            <Feather name="edit-3" size={16} color={theme.colors.primary2} />
          </Pressable>
        </View>

        {!profile ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather name="briefcase" size={20} color={theme.colors.primary} />
            </View>

            <Text style={styles.emptyTitle}>Profil entreprise manquant</Text>
            <Text style={styles.emptyText}>
              Tu dois d’abord créer ton profil avant de gérer la vérification et les publications.
            </Text>

            <Pressable
              onPress={() => router.push("/(company-tabs)/edit-profile" as any)}
              style={styles.primaryAction}
            >
              <Feather name="plus-circle" size={18} color="#fff" />
              <Text style={styles.primaryActionText}>Créer mon profil</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {verificationState && (
              <View style={[styles.statusCard, currentBadge.wrap as any]}>
                <View style={[styles.statusIconWrap, currentBadge.iconBg as any]}>
                  <Feather
                    name={verificationState.icon as any}
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>

                <View style={styles.statusContent}>
                  <Text style={[styles.statusTitle, currentBadge.title as any]}>
                    {verificationState.title}
                  </Text>
                  <Text style={[styles.statusText, currentBadge.text as any]}>
                    {verificationState.message}
                  </Text>

                  <Pressable
                    style={styles.statusButton}
                    onPress={() => router.push("/company/verification" as any)}
                  >
                    <Feather name="shield" size={16} color={theme.colors.primary} />
                    <Text style={styles.statusButtonText}>Gérer la vérification</Text>
                  </Pressable>
                </View>
              </View>
            )}

            <Section title="Entreprise">
              <Row
                icon="briefcase"
                label="Informations de l’entreprise"
                value={profile.companyName}
                onPress={() => router.push("/(company-tabs)/edit-profile" as any)}
              />
              <Row
                icon="map-pin"
                label="Ville"
                value={profile.city}
                onPress={() => router.push("/(company-tabs)/edit-profile" as any)}
              />
              <Row
                icon="phone"
                label="Téléphone"
                value={profile.phone}
                onPress={() => router.push("/(company-tabs)/edit-profile" as any)}
              />
              <Row
                icon="layers"
                label="Secteur"
                value={profile.sector}
                onPress={() => router.push("/(company-tabs)/edit-profile" as any)}
                hideDivider
              />
            </Section>

            <Section title="Vérification & offres">
              <Row
                icon="shield"
                label="Vérification entreprise"
                value={profile.verificationStatus}
                onPress={() => router.push("/(company-tabs)/verification" as any)}
              />
              <Row
                icon="briefcase"
                label="Mes publications"
                onPress={() => goIfProfileExists("/(company-tabs)/publications")}
              />
              <Row
                icon="plus-circle"
                label="Publier une offre"
                onPress={() => goIfProfileExists("/(company-tabs)/create-job")}
                hideDivider
              />
            </Section>

            <Section title="Compte">
              <Row
                icon="mail"
                label="Adresse email"
                value={user?.email || "-"}
                onPress={() => Alert.alert("Compte", user?.email || "Email indisponible")}
              />
              <Row
                icon="bell"
                label="Notifications"
                onPress={() => router.push("/(company-tabs)/notifications" as any)}
                hideDivider
              />
            </Section>

            {!!profile.description && (
              <View style={styles.aboutCard}>
                <Text style={styles.aboutTitle}>À propos</Text>
                <Text style={styles.aboutText}>{profile.description}</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.dangerCard}>
          <Row
            icon="log-out"
            label="Se déconnecter"
            danger
            onPress={handleLogout}
            hideDivider
          />
        </View>

        <Text style={styles.footer}>StageConnect CM • Version 1.0</Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
  value,
  onPress,
  danger,
  hideDivider,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  hideDivider?: boolean;
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

      <View style={{ flex: 1 }}>
        <Text
          style={[styles.rowLabel, danger ? { color: theme.colors.danger } : null]}
        >
          {label}
        </Text>
        {!!value && <Text style={styles.rowValue}>{value}</Text>}
      </View>

      <Feather name="chevron-right" size={18} color={theme.colors.faint} />

      {!hideDivider && <View style={styles.divider} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
  },
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
    maxWidth: 340,
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
  emptyCard: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
    ...theme.shadow.soft,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    color: theme.colors.muted,
    marginTop: 8,
    lineHeight: 21,
    fontWeight: "600",
  },
  primaryAction: {
    marginTop: 16,
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  primaryActionText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
  statusCard: {
    marginTop: theme.spacing.lg,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
  },
  statusIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  statusText: {
    marginTop: 6,
    lineHeight: 21,
    fontWeight: "600",
  },
  statusButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D7E3F4",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusButtonText: {
    color: theme.colors.primary,
    fontWeight: "800",
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
    color: theme.colors.text,
    fontSize: 14.5,
    fontWeight: "bold",
  },
  rowValue: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 12.5,
    fontWeight: "700",
  },
  divider: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 0,
    height: 1,
    backgroundColor: theme.colors.stroke,
  },
  aboutCard: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
    ...theme.shadow.soft,
  },
  aboutTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },
  aboutText: {
    color: theme.colors.muted,
    lineHeight: 22,
    fontWeight: "600",
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