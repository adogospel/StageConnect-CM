import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { theme } from "../../../constants/theme";
import Button from "../../../components/ui/Button";
import { Job } from "../../../components/JobCard";
import { applyToJob } from "../../../src/services/applications";

// ✅ Backend
import { getJobById } from "../../../src/services/jobs";

// --- helpers ---
function daysAgoLabel(dateIso?: string) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Aujourd’hui";
  if (days === 1) return "Hier";
  return `${days}j`;
}

function normalizeJob(j: any): Job & {
  // infos extra (utiles en détails)
  description?: string;
  salary?: string;
  duration?: string;
  deadline?: string;
} {
  const companyName = j?.company?.companyName || "Entreprise";
  const city = j?.city || j?.company?.city || "—";

  return {
    id: j?._id,
    title: j?.title || "Offre",
    company: companyName,
    city,
    contractType: j?.contractType || "—",
    isPaid: !!j?.isPaid,
    domain: j?.domain || "—",
    premium: !!j?.isPremium,
    createdAtLabel: daysAgoLabel(j?.createdAt),

    // extra fields (pas obligatoires pour JobCard mais utiles ici)
    description: j?.description,
    salary: j?.salary,
    duration: j?.duration,
    deadline: j?.deadline,
  };
}

export default function JobDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [job, setJob] = useState<(Job & any) | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ fetch job real
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        const data = await getJobById(String(id));

        // ton backend renvoie un objet job direct (normalement)
        const j = data?.job ?? data?.data ?? data;
        const normalized = normalizeJob(j);

        if (mounted) setJob(normalized);
      } catch (e: any) {
        if (mounted) setJob(null);
        Alert.alert(
          "Erreur",
          e?.response?.data?.message || e?.message || "Impossible de charger l’offre."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (id) run();

    return () => {
      mounted = false;
    };
  }, [id]);

  const [applying, setApplying] = useState(false);

  const onApply = async () => {
  try {
    setApplying(true);

    // message optionnel (tu peux laisser vide pour l’instant)
    await applyToJob(job.id);

    Alert.alert("Candidature envoyée ✅", "Tu peux suivre ça dans 'Candidatures'.");
    router.push("/(student-tabs)/applications");
  } catch (e: any) {
    Alert.alert(
      "Impossible de postuler",
      e?.response?.data?.message || e?.message || "Erreur"
    );
  } finally {
    setApplying(false);
  }
};

  const resumeText = useMemo(() => {
    if (!job) return "";
    // Si backend a description, on l’utilise; sinon on garde ton texte propre.
    return (
      job.description ||
      "Nous recherchons un profil motivé pour rejoindre notre équipe et contribuer à des projets concrets. Tu travailleras avec des outils modernes, un encadrement, et des tâches progressives selon ton niveau."
    );
  }, [job]);

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center", padding: 24 }]}>
        <Text style={{ color: theme.colors.text, fontWeight: "900" }}>Chargement…</Text>
        <Text
          style={{
            color: theme.colors.muted,
            fontWeight: "700",
            marginTop: 8,
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          On récupère les détails de l’offre.
        </Text>

        <Pressable onPress={() => router.back()} style={{ marginTop: 14 }}>
          <Text style={{ color: theme.colors.primary2, fontWeight: "900" }}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: theme.colors.muted, fontWeight: "700" }}>Offre introuvable.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 14 }}>
          <Text style={{ color: theme.colors.primary2, fontWeight: "900" }}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Top bar iOS clean */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <Feather name="chevron-left" size={20} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.topTitle} numberOfLines={1}>
          Détails
        </Text>

        <Pressable
          onPress={() => Alert.alert("Partage", "Sprint futur 🙂")}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <Feather name="share-2" size={18} color={theme.colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleBlock}>
          <View style={styles.badgeRow}>
            {job.premium && (
              <View style={[styles.pill, styles.pillPremium]}>
                <Feather name="star" size={12} color="#fff" />
                <Text style={[styles.pillText, { color: "#fff" }]}>Premium</Text>
              </View>
            )}
            <View style={styles.pill}>
              <Text style={styles.pillText}>{job.contractType}</Text>
            </View>
            {job.isPaid && (
              <View style={[styles.pill, styles.pillPaid]}>
                <Feather name="dollar-sign" size={12} color={theme.colors.success} />
                <Text style={[styles.pillText, { color: theme.colors.success }]}>Payé</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>
            {job.company} • <Text style={styles.city}>{job.city}</Text>
          </Text>

          <View style={styles.metaRow}>
            <Meta icon="clock" label={job.createdAtLabel} />
            <Meta icon="layers" label={job.domain} />
          </View>
        </View>

        {/* Section: Résumé */}
        <Section title="Résumé">
          <Text style={styles.paragraph}>{resumeText}</Text>
        </Section>

        {/* Section: Missions */}
        <Section title="Missions principales">
          <Bullet text="Participer au développement de fonctionnalités." />
          <Bullet text="Collaborer avec l’équipe (UI/Backend/QA)." />
          <Bullet text="Améliorer la qualité (tests, corrections, optimisation)." />
        </Section>

        {/* Section: Profil recherché */}
        <Section title="Profil recherché">
          <Bullet text="Bonne base + envie d’apprendre." />
          <Bullet text="Sérieux, ponctuel, esprit d’équipe." />
          <Bullet text={`Connaissances du domaine : ${job.domain}`} />
        </Section>

        {/* Section: Infos */}
        <Section title="Informations">
          <InfoRow icon="map-pin" label="Ville" value={job.city} />
          <InfoRow icon="file-text" label="Contrat" value={job.contractType} />
          <InfoRow icon="credit-card" label="Rémunération" value={job.isPaid ? "Oui" : "Non"} />
          {!!job.salary && <InfoRow icon="dollar-sign" label="Salaire" value={String(job.salary)} />}
          {!!job.duration && <InfoRow icon="calendar" label="Durée" value={String(job.duration)} />}
          {!!job.deadline && (
            <InfoRow
              icon="alert-circle"
              label="Deadline"
              value={new Date(job.deadline).toLocaleDateString()}
            />
          )}
        </Section>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Bottom action bar */}
      <View style={styles.bottomBar}>
        <Button title={applying ? "Envoi..." : "Postuler maintenant"} onPress={onApply} loading={applying} />
        <Pressable onPress={() => Alert.alert("Sauvegarde", "Sprint futur 🙂")} style={styles.saveBtn}>
          <Feather name="bookmark" size={18} color={theme.colors.text} />
          <Text style={styles.saveText}>Sauvegarder</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Meta({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  return (
    <View style={styles.meta}>
      <Feather name={icon} size={14} color={theme.colors.faint} />
      <Text style={styles.metaText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View style={styles.infoIcon}>
          <Feather name={icon} size={16} color={theme.colors.text} />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  topBar: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stroke,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  titleBlock: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
    ...theme.shadow.soft,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  pillPaid: {
    backgroundColor: "rgba(16,185,129,0.10)",
    borderColor: "rgba(16,185,129,0.22)",
  },
  pillText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  company: {
    color: theme.colors.muted,
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 14,
  },
  city: {
    color: theme.colors.text,
    fontWeight: "900",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    maxWidth: "100%",
  },
  metaText: {
    color: theme.colors.faint,
    fontSize: 12.5,
    fontWeight: "800",
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    ...theme.text.h2,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: theme.spacing.lg,
  },
  paragraph: {
    color: theme.colors.muted,
    fontSize: 13.8,
    fontWeight: "bold",
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    color: theme.colors.muted,
    fontSize: 13.8,
    fontWeight: "bold",
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.stroke,
    gap: 12,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: "60%",
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  infoValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    maxWidth: "40%",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.stroke,
  },
  saveBtn: {
    marginTop: 10,
    height: 46,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  saveText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
});