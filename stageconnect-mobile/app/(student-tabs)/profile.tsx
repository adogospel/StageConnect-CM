import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../../constants/theme";
import { logout, getMe } from "../../src/services/auth";
import { getMyStudentProfile } from "../../src/services/students";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [meData, profileData] = await Promise.all([
        getMe(),
        getMyStudentProfile(),
      ]);

      setUser(meData || null);
      setProfile(profileData || null);
    } catch (err: any) {
      Alert.alert(
        "Erreur",
        err?.response?.data?.message || "Impossible de charger le profil"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
  };

  const go = (label: string) => {
    Alert.alert(label, "Écran à venir 🙂");
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch {
      Alert.alert("Erreur", "Impossible de se déconnecter.");
    }
  };

  const openCV = async () => {
    if (!profile?.cvUrl) {
      return Alert.alert("CV", "Aucun CV enregistré pour le moment.");
    }

    try {
      await Linking.openURL(profile.cvUrl);
    } catch {
      Alert.alert("Erreur", "Impossible d’ouvrir le CV.");
    }
  };

  const candidateTypeLabel = useMemo(() => {
    if (profile?.candidateType === "worker") return "Travailleur";
    return "Étudiant";
  }, [profile]);

  const fullName = useMemo(() => {
    return `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
  }, [profile]);

  const subtitle = useMemo(() => {
    const email = user?.email || profile?.user?.email || "";
    const city = profile?.city || "";
    const pieces = [candidateTypeLabel, city, email].filter(Boolean);
    return pieces.join(" • ");
  }, [candidateTypeLabel, profile, user]);

  const stats = useMemo(() => {
    return {
      skills: Array.isArray(profile?.skills) ? profile.skills.length : 0,
      hasCV: !!profile?.cvUrl,
      phone: !!profile?.phone,
    };
  }, [profile]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.emptyTitle}>Profil indisponible</Text>
        <Text style={styles.emptySub}>
          Impossible de charger tes informations pour le moment.
        </Text>

        <Pressable style={styles.retryBtn} onPress={loadProfile}>
          <Text style={styles.retryBtnText}>Réessayer</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.sub}>Gère ton compte et tes informations.</Text>

        {/* HERO PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Feather name="user" size={22} color={theme.colors.text} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {fullName || "Utilisateur"}
            </Text>

            <Text style={styles.meta} numberOfLines={2}>
              {subtitle || "Profil candidat"}
            </Text>
          </View>

          <Pressable onPress={() => go("Modifier profil")} style={styles.editBtn}>
            <Feather name="edit-3" size={16} color={theme.colors.primary2} />
          </Pressable>
        </View>

        {/* MINI STATS */}
        <View style={styles.statsRow}>
          <StatCard label="Compétences" value={String(stats.skills)} icon="cpu" />
          <StatCard label="CV" value={stats.hasCV ? "Oui" : "Non"} icon="file-text" />
          <StatCard label="Téléphone" value={stats.phone ? "Oui" : "Non"} icon="phone" />
        </View>

        {/* PROFIL DETAILS */}
        <Section title="Informations personnelles">
          <InfoRow label="Nom complet" value={fullName || "—"} />
          <InfoRow label="Email" value={user?.email || profile?.user?.email || "—"} />
          <InfoRow label="Téléphone" value={profile?.phone || "—"} />
          <InfoRow label="Ville" value={profile?.city || "—"} />
          <InfoRow label="Type de profil" value={candidateTypeLabel} />
        </Section>

        {profile?.candidateType === "student" ? (
          <Section title="Parcours académique">
            <InfoRow label="Université / École" value={profile?.university || "—"} />
            <InfoRow label="Filière" value={profile?.fieldOfStudy || "—"} />
            <InfoRow label="Niveau" value={profile?.level || "—"} />
          </Section>
        ) : (
          <Section title="Parcours professionnel">
            <InfoRow label="Secteur d’activité" value={profile?.activitySector || "—"} />
            <InfoRow
              label="Années d’expérience"
              value={
                profile?.yearsOfExperience !== undefined &&
                profile?.yearsOfExperience !== null
                  ? `${profile.yearsOfExperience} an(s)`
                  : "—"
              }
            />
            <InfoRow
              label="Dernier diplôme"
              value={profile?.highestEducation || "—"}
            />
          </Section>
        )}

        <Section title="Compétences">
          {Array.isArray(profile?.skills) && profile.skills.length > 0 ? (
            <View style={styles.skillsWrap}>
              {profile.skills.map((skill: string, index: number) => (
                <View key={`${skill}-${index}`} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyInline}>Aucune compétence renseignée.</Text>
          )}
        </Section>

        <Section title="Documents">
          <Pressable style={styles.rowBtn} onPress={openCV}>
            <View style={styles.rowBtnLeft}>
              <Feather name="file-text" size={17} color={theme.colors.primary2} />
              <Text style={styles.rowBtnLabel}>Mon CV</Text>
            </View>

            <View style={styles.rowBtnRight}>
              <Text style={styles.rowBtnMeta}>
                {profile?.cvUrl ? "Disponible" : "Non ajouté"}
              </Text>
              <Feather name="chevron-right" size={16} color={theme.colors.faint} />
            </View>
          </Pressable>
        </Section>

        <Section title="Compte">
          <MenuRow
            icon="edit-3"
            label="Modifier mon profil"
            onPress={() => go("Modifier profil")}
          />
          <MenuRow
            icon="shield"
            label="Sécurité"
            onPress={() => go("Sécurité")}
          />
          <MenuRow
            icon="settings"
            label="Préférences"
            onPress={() => go("Préférences")}
          />
        </Section>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#fff" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>

        <Text style={styles.footer}>
          Ton profil est chargé dynamiquement depuis le backend.
        </Text>
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.rowBtn} onPress={onPress}>
      <View style={styles.rowBtnLeft}>
        <Feather name={icon} size={17} color={theme.colors.primary2} />
        <Text style={styles.rowBtnLabel}>{label}</Text>
      </View>

      <Feather name="chevron-right" size={16} color={theme.colors.faint} />
    </Pressable>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Feather name={icon} size={15} color={theme.colors.primary2} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  container: {
    padding: theme.spacing.lg,
    paddingBottom: 36,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
    padding: 24,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.text,
  },

  emptySub: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },

  retryBtn: {
    marginTop: 18,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },

  retryBtnText: {
    color: "#fff",
    fontWeight: "800",
  },

  title: {
    color: theme.colors.text,
    ...theme.text.h1,
    marginTop: 4,
  },

  sub: {
    color: theme.colors.muted,
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 18,
  },

  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...theme.shadow.soft,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: theme.colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  name: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900",
  },

  meta: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 4,
  },

  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    marginBottom: 18,
  },

  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    ...theme.shadow.soft,
  },

  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface2,
    marginBottom: 8,
  },

  statValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },

  statLabel: {
    color: theme.colors.muted,
    fontSize: 11.5,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },

  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
    marginBottom: 14,
    ...theme.shadow.soft,
  },

  sectionTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 14,
  },

  infoRow: {
    marginBottom: 12,
  },

  infoLabel: {
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  infoValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.08)",
    borderWidth: 1,
    borderColor: "rgba(59,130,246,0.18)",
  },

  skillText: {
    color: theme.colors.primary2,
    fontSize: 12.5,
    fontWeight: "800",
  },

  emptyInline: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },

  rowBtn: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    backgroundColor: theme.colors.surface2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  rowBtnLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  rowBtnRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  rowBtnLabel: {
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: "800",
  },

  rowBtnMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },

  logoutBtn: {
    marginTop: 8,
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    ...theme.shadow.soft,
  },

  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },

  footer: {
    marginTop: theme.spacing.lg,
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});