import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { getMyCompanyProfile } from "../../src/services/company";

type CompanyProfile = {
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

export default function CompanyHome() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getMyCompanyProfile();
      setProfile(data);
    } catch (err) {
      setProfile(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
  };

  const verificationState = useMemo(() => {
    if (!profile) return null;

    if (profile.isVerified && profile.verificationStatus === "verified") {
      return {
        tone: "success" as const,
        title: "Entreprise vérifiée",
        message:
          "Ton entreprise est validée. Tu peux publier des offres et gérer tes candidatures.",
        icon: "check-circle",
      };
    }

    if (profile.verificationStatus === "pending") {
      return {
        tone: "warning" as const,
        title: "Validation en attente",
        message:
          "Tes documents ont bien été envoyés. L’admin doit encore vérifier le dossier avant d’autoriser les publications.",
        icon: "clock",
      };
    }

    if (profile.verificationStatus === "rejected") {
      return {
        tone: "danger" as const,
        title: "Validation rejetée",
        message:
          profile.verificationNote ||
          "Le dossier a été rejeté. Corrige les éléments demandés puis renvoie de nouveaux documents.",
        icon: "x-circle",
      };
    }

    return {
      tone: "neutral" as const,
      title: "Vérification non envoyée",
      message:
        "Tu dois encore envoyer les documents de ton entreprise avant de pouvoir publier une offre.",
      icon: "shield",
    };
  }, [profile]);

  const canPublish =
    !!profile &&
    profile.isVerified === true &&
    profile.verificationStatus === "verified";

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

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Feather name="briefcase" size={24} color="#2563EB" />
            </View>

            <Text style={styles.title}>Complète ton profil entreprise</Text>

            <Text style={styles.subtitle}>
              Avant de publier des offres, tu dois d’abord créer le profil de
              ton entreprise avec les informations principales.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push("/(company-tabs)/edit-profile" as any)}
            >
              <Feather name="plus-circle" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>Créer mon profil</Text>
            </Pressable>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Ce qu’il faut ensuite</Text>
            <Text style={styles.infoText}>1. Créer le profil entreprise</Text>
            <Text style={styles.infoText}>2. Envoyer les documents</Text>
            <Text style={styles.infoText}>3. Attendre la validation admin</Text>
            <Text style={styles.infoText}>4. Publier les offres</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const tone = verificationState?.tone || "neutral";
  const currentBadge = badgeStyles(tone);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>Entreprise</Text>
              <Text style={styles.welcome}>Bienvenue, {profile.companyName}</Text>
              <Text style={styles.subtitle}>
                Gère la validation de ton entreprise et prépare tes prochaines
                publications.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <Feather name="briefcase" size={24} color="#2563EB" />
            </View>
          </View>
        </View>

        {verificationState && (
          <View style={[styles.statusCard, currentBadge.wrap as any]}>
            <View style={[styles.statusIconWrap, currentBadge.iconBg as any]}>
              <Feather
                name={verificationState.icon as any}
                size={18}
                color="#2563EB"
              />
            </View>

            <View style={styles.statusContent}>
              <Text style={[styles.statusTitle, currentBadge.title as any]}>
                {verificationState.title}
              </Text>
              <Text style={[styles.statusText, currentBadge.text as any]}>
                {verificationState.message}
              </Text>

              {!canPublish && (
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => router.push("/company/verification" as any)}
                >
                  <Feather name="shield" size={16} color="#2563EB" />
                  <Text style={styles.secondaryButtonText}>
                    Gérer la vérification
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        <View style={styles.grid}>
          <View style={styles.smallCard}>
            <Text style={styles.smallLabel}>Secteur</Text>
            <Text style={styles.smallValue}>{profile.sector}</Text>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.smallLabel}>Ville</Text>
            <Text style={styles.smallValue}>{profile.city}</Text>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.smallLabel}>Téléphone</Text>
            <Text style={styles.smallValue}>{profile.phone}</Text>
          </View>

          <View style={styles.smallCard}>
            <Text style={styles.smallLabel}>Statut</Text>
            <Text style={styles.smallValue}>{profile.verificationStatus}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>

          <View style={styles.actions}>
            <Pressable
              style={[
                styles.actionButton,
                !canPublish && styles.actionButtonDisabled,
              ]}
              onPress={() => {
                if (!canPublish) {
                  router.push("/company/verification" as any);
                  return;
                }
                router.push("/company/create-job" as any);
              }}
            >
              <Feather
                name={canPublish ? "plus-circle" : "lock"}
                size={18}
                color={canPublish ? "#fff" : "#0F172A"}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  !canPublish && styles.actionButtonTextDisabled,
                ]}
              >
                {canPublish ? "Publier une offre" : "Publication verrouillée"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.outlineButton}
              onPress={() => router.push("/(company-tabs)/publications" as any)}
            >
              <Feather name="briefcase" size={18} color="#2563EB" />
              <Text style={styles.outlineButtonText}>Voir mes publications</Text>
            </Pressable>

            <Pressable
              style={styles.outlineButton}
              onPress={() => router.push("/company/edit-profile" as any)}
            >
              <Feather name="edit-3" size={18} color="#2563EB" />
              <Text style={styles.outlineButtonText}>Modifier le profil</Text>
            </Pressable>
          </View>
        </View>

        {!!profile.description && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.description}>{profile.description}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F8FC",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F8FC",
  },
  content: {
    padding: 18,
    paddingBottom: 32,
    gap: 16,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  welcome: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  title: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 21,
  },
  primaryButton: {
    marginTop: 18,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
  statusCard: {
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
  },
  secondaryButton: {
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
  secondaryButtonText: {
    color: "#2563EB",
    fontWeight: "800",
  },
  grid: {
    gap: 12,
  },
  smallCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  smallLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 6,
  },
  smallValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 14,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  actionButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  actionButtonTextDisabled: {
    color: "#0F172A",
  },
  outlineButton: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D7E3F4",
    backgroundColor: "#F8FBFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  outlineButtonText: {
    color: "#2563EB",
    fontWeight: "800",
  },
  description: {
    color: "#475569",
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 10,
  },
  infoText: {
    color: "#475569",
    lineHeight: 24,
  },
});