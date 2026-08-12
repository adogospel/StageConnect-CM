import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { theme } from "../../constants/theme";
import {
  getJobs,
  resolveJobImageUrl,
} from "../../src/services/jobs";

type Job = {
  id: string;
  title: string;
  description: string;
  company: string;
  city: string;
  contractType: string;
  workMode: string;
  isPaid: boolean;
  salary: string;
  domain: string;
  premium: boolean;
  imageUrl: string;
  createdAtLabel: string;
};

type ChipKey =
  | "all"
  | "paid"
  | "remote"
  | "tech";

function daysAgoLabel(dateIso?: string) {
  if (!dateIso) {
    return "";
  }

  const date = new Date(dateIso);
  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  if (days <= 0) {
    return "Aujourd’hui";
  }

  if (days === 1) {
    return "Hier";
  }

  return `Il y a ${days}j`;
}

function normalizeJobs(
  apiJobs: any[]
): Job[] {
  return (apiJobs || [])
    .map((job: any) => {
      const companyName =
        job?.company?.companyName ||
        "Entreprise";

      const city =
        job?.city ||
        job?.company?.city ||
        "—";

      return {
        id: String(job?._id || ""),

        title:
          String(job?.title || "").trim() ||
          "Offre",

        description: String(
          job?.description || ""
        ).trim(),

        company: companyName,
        city,

        contractType:
          job?.contractType || "—",

        workMode:
          job?.workMode || "Présentiel",

        isPaid: Boolean(job?.isPaid),

        salary: String(
          job?.salary || ""
        ).trim(),

        domain:
          job?.domain || "—",

        premium:
          Boolean(job?.isPremium),

        imageUrl:
          job?.imageUrl || "",

        createdAtLabel:
          daysAgoLabel(job?.createdAt),
      };
    })
    .filter((job) => Boolean(job.id));
}

export default function Jobs() {
  const [query, setQuery] = useState("");
  const [chip, setChip] =
    useState<ChipKey>("all");

  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadJobs = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const data = await getJobs();

        const list = Array.isArray(data)
          ? data
          : data?.jobs ??
            data?.data ??
            [];

        setJobs(normalizeJobs(list));
      } catch (error: any) {
        Alert.alert(
          "Erreur",
          error?.response?.data?.message ||
            error?.message ||
            "Impossible de charger les offres."
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const onRefresh = useCallback(
    async () => {
      try {
        setRefreshing(true);
        await loadJobs(false);
      } finally {
        setRefreshing(false);
      }
    },
    [loadJobs]
  );

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return jobs.filter((job) => {
      const matchQuery =
        !normalizedQuery ||
        job.title
          .toLowerCase()
          .includes(normalizedQuery) ||
        job.description
          .toLowerCase()
          .includes(normalizedQuery) ||
        job.company
          .toLowerCase()
          .includes(normalizedQuery) ||
        job.domain
          .toLowerCase()
          .includes(normalizedQuery) ||
        job.city
          .toLowerCase()
          .includes(normalizedQuery);

      const normalizedMode =
        job.workMode.toLowerCase();

      const normalizedDomain =
        job.domain.toLowerCase();

      const matchChip =
        chip === "all" ||
        (chip === "paid" && job.isPaid) ||
        (chip === "remote" &&
          ["remote", "hybride"].includes(
            normalizedMode
          )) ||
        (chip === "tech" &&
          (normalizedDomain.includes(
            "informat"
          ) ||
            normalizedDomain.includes(
              "dev"
            ) ||
            normalizedDomain.includes(
              "tech"
            )));

      return matchQuery && matchChip;
    });
  }, [jobs, query, chip]);

  const openJob = (id: string) => {
    router.push(
      `/student/job/${id}` as any
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[
            "#EAF2FF",
            "#F7FAFF",
            "#FFFFFF",
          ]}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>
            Trouve un emploi
          </Text>

          <Text style={styles.heroSub}>
            Offres premium, stages, CDD,
            CDI, freelance et plus.
          </Text>

          <View style={styles.searchWrap}>
            <Feather
              name="search"
              size={18}
              color={theme.colors.faint}
            />

            <TextInput
              placeholder="Rechercher un poste, une ville, un domaine..."
              placeholderTextColor={theme.colors.faint}
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </LinearGradient>

        <View style={styles.chipsRow}>
          {[
            ["all", "Tous"],
            ["paid", "Rémunérés"],
            ["remote", "Remote"],
            ["tech", "Tech"],
          ].map(([key, label]) => {
            const active = chip === key;

            return (
              <Pressable
                key={key}
                onPress={() =>
                  setChip(key as ChipKey)
                }
                style={[
                  styles.filterChip,
                  active &&
                    styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : filteredJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Feather
                name="search"
                size={24}
                color={theme.colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Aucune offre trouvée
            </Text>

            <Text style={styles.emptyText}>
              Essaie une autre recherche ou recharge la page.
            </Text>
          </View>
        ) : (
          filteredJobs.map((job) => {
            const imageUrl =
              resolveJobImageUrl(job.imageUrl);

            return (
              <Pressable
                key={job.id}
                style={styles.card}
                onPress={() =>
                  openJob(job.id)
                }
              >
                {!!imageUrl && (
                  <JobCardFlyer
                    imageUrl={imageUrl}
                  />
                )}

                <View style={styles.cardTop}>
                  <View style={styles.badges}>
                    {job.premium ? (
                      <View
                        style={[
                          styles.pill,
                          styles.pillPremium,
                        ]}
                      >
                        <Text style={styles.pillPremiumText}>
                          Premium
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.pill}>
                      <Text style={styles.pillText}>
                        {job.contractType}
                      </Text>
                    </View>

                    <View style={styles.pill}>
                      <Text style={styles.pillText}>
                        {job.workMode}
                      </Text>
                    </View>

                    {job.isPaid ? (
                      <View
                        style={[
                          styles.pill,
                          styles.pillPaid,
                        ]}
                      >
                        <Text style={styles.pillPaidText}>
                          Rémunéré
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.time}>
                    {job.createdAtLabel}
                  </Text>
                </View>

                <Text style={styles.jobTitle}>
                  {job.title}
                </Text>

                <Text style={styles.company}>
                  {job.company}
                </Text>

                {!!job.description && (
                  <Text
                    style={styles.description}
                    numberOfLines={2}
                  >
                    {job.description}
                  </Text>
                )}

                <View style={styles.footerRow}>
                  <View style={styles.domainRow}>
                    <Feather
                      name="map-pin"
                      size={14}
                      color={theme.colors.faint}
                    />

                    <Text
                      style={styles.domain}
                      numberOfLines={1}
                    >
                      {job.city}
                    </Text>
                  </View>

                  <View style={styles.domainRow}>
                    <Feather
                      name="briefcase"
                      size={14}
                      color={theme.colors.faint}
                    />

                    <Text
                      style={styles.domain}
                      numberOfLines={1}
                    >
                      {job.domain}
                    </Text>
                  </View>

                  <Feather
                    name="chevron-right"
                    size={18}
                    color={theme.colors.faint}
                  />
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function JobCardFlyer({
  imageUrl,
}: {
  imageUrl: string;
}) {
  /*
   * Ratio vertical par défaut en attendant
   * que React Native récupère les vraies dimensions.
   */
  const [aspectRatio, setAspectRatio] = useState(0.7);

  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    Image.getSize(
      imageUrl,
      (width, height) => {
        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => {
        setAspectRatio(0.7);
      }
    );
  }, [imageUrl]);

  return (
    <View style={styles.cardImageWrap}>
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.cardImage,
          {
            aspectRatio,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  container: {
    padding: 16,
    paddingBottom: 120,
  },

  hero: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.text,
  },

  heroSub: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.muted,
    lineHeight: 20,
  },

  searchWrap: {
    marginTop: 16,
    height: 52,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },

  chipsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  filterChipActive: {
    backgroundColor: "#EAF2FF",
    borderColor: theme.colors.primary,
  },

  filterChipText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },

  filterChipTextActive: {
    color: theme.colors.primary,
  },

  loaderWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: theme.colors.text,
  },

  emptyText: {
    marginTop: 8,
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: 16,
    marginBottom: 14,
  },

  /*
   * Conteneur du flyer dans la carte.
   * Sa hauteur dépend du vrai ratio de l’image.
   */
  cardImageWrap: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
  },

  /*
   * Pas de hauteur fixe.
   * L’aspectRatio détermine automatiquement la hauteur.
   */
  cardImage: {
    width: "100%",
    height: undefined,
    backgroundColor: "#F8FAFC",
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  badges: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
    marginRight: 10,
  },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
  },

  pillPremium: {
    backgroundColor: theme.colors.primary2,
    borderColor: "transparent",
  },

  pillPremiumText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },

  pillPaid: {
    backgroundColor: "rgba(16,185,129,0.10)",
    borderColor: "rgba(16,185,129,0.22)",
  },

  pillText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },

  pillPaidText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: "900",
  },

  time: {
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "700",
  },

  jobTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
  },

  company: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },

  description: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    marginBottom: 14,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },

  domain: {
    flex: 1,
    color: theme.colors.faint,
    fontSize: 12.5,
    fontWeight: "800",
  },
});