import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { theme } from "../constants/theme";

export type Job = {
  id: string;
  title: string;
  company: string;
  city: string;
  contractType: "Stage" | "CDD" | "CDI" | "Freelance";
  isPaid: boolean;
  domain: string;
  premium?: boolean;
  createdAtLabel: string;
};

export default function JobCard({
  job,
  variant = "vertical",
  onPress,
}: {
  job: Job;
  variant?: "vertical" | "horizontal";
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        variant === "horizontal" ? styles.cardHorizontal : null,
        job.premium ? styles.premiumBorder : null,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.badges}>
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

        <Text style={styles.time}>{job.createdAtLabel}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {job.title}
      </Text>

      <Text style={styles.company} numberOfLines={1}>
        {job.company} • <Text style={styles.city}>{job.city}</Text>
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.domainRow}>
          <Feather name="layers" size={14} color={theme.colors.faint} />
          <Text style={styles.domain} numberOfLines={1}>
            {job.domain}
          </Text>
        </View>

        <Feather name="chevron-right" size={18} color={theme.colors.faint} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    padding: 14,
    ...theme.shadow.soft,
  },
  cardHorizontal: {
    width: 285,
    marginRight: 12,
  },
  premiumBorder: {
    borderColor: "rgba(99,102,241,0.28)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  pill: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
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
  time: {
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  company: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },
  city: {
    color: theme.colors.text,
    fontWeight: "900",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  domain: {
    color: theme.colors.faint,
    fontSize: 12.5,
    fontWeight: "800",
  },
});