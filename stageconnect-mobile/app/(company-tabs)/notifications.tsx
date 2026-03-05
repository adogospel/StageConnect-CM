import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { theme } from "../../constants/theme";
import { useNotificationsStore } from "../../src/store/notificationsStore";

type NotifType = "apply" | "status" | "system";

type Notif = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const FAKE_NOTIFS: Notif[] = [
  {
    id: "n1",
    type: "apply",
    title: "Candidature envoyée",
    body: "Ta candidature a bien été envoyée à Blumdesk Sarl.",
    time: "Aujourd’hui • 12:10",
    read: false,
  },
  {
    id: "n2",
    type: "status",
    title: "Statut mis à jour",
    body: "Bonne nouvelle : ta candidature a été acceptée par StageConnect Labs 🎉",
    time: "Hier • 18:42",
    read: false,
  },
  {
    id: "n3",
    type: "status",
    title: "Statut mis à jour",
    body: "Ta candidature chez Nova Studio a été refusée. Ne lâche rien 💪",
    time: "Il y a 5 jours",
    read: true,
  },
  {
    id: "n4",
    type: "system",
    title: "Bienvenue sur StageConnect",
    body: "Complète ton profil pour augmenter tes chances (CV, domaine, ville).",
    time: "Il y a 1 semaine",
    read: true,
  },
];

export default function Notifications() {
  const items = useNotificationsStore((s) => s.items);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const markRead = useNotificationsStore((s) => s.markRead);

  const openNotif = (id: string) => {
    markRead(id);
    Alert.alert("Notification", "Action simulée ✅ (deep link plus tard).");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.sub}>
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "Tout est à jour ✅"}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => Alert.alert("Filtre", "Sprint futur 🙂")}
              style={styles.iconBtn}
            >
              <Feather name="sliders" size={18} color={theme.colors.text} />
            </Pressable>

            <Pressable
              onPress={markAllRead}
              style={[styles.markBtn, unreadCount === 0 ? styles.markBtnDisabled : null]}
              disabled={unreadCount === 0}
            >
              <Text
                style={[
                  styles.markText,
                  unreadCount === 0 ? { color: theme.colors.faint } : null,
                ]}
              >
                Tout lu
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.inboxCard}>
          {items.length === 0 ? (
            <View style={{ paddingVertical: 18 }}>
              <Text style={{ color: theme.colors.muted, fontWeight: "700", textAlign: "center" }}>
                Aucune notification.
              </Text>
            </View>
          ) : (
            items.map((n, idx) => (
              <Pressable key={n.id} onPress={() => openNotif(n.id)} style={styles.row}>
                <View style={[styles.iconWrap, n.read ? styles.iconRead : styles.iconUnread]}>
                  <Feather
                    name={iconByType(n.type)}
                    size={18}
                    color={n.read ? theme.colors.faint : theme.colors.primary}
                  />
                </View>

                <View style={styles.content}>
                  <View style={styles.topLine}>
                    <Text
                      style={[styles.rowTitle, !n.read ? styles.rowTitleUnread : null]}
                      numberOfLines={1}
                    >
                      {n.title}
                    </Text>
                    <Text style={styles.time}>{n.time}</Text>
                  </View>

                  <Text style={styles.body} numberOfLines={2}>
                    {n.body}
                  </Text>

                  {!n.read && <View style={styles.unreadDot} />}
                </View>

                <Feather name="chevron-right" size={18} color={theme.colors.faint} />
                {idx !== items.length - 1 && <View style={styles.divider} />}
              </Pressable>
            ))
          )}
        </View>

        <Text style={styles.footer}>
          Astuce : garde tes notifications actives pour ne rien rater (Sprint futur).
        </Text>

        <View style={{ height: 26 }} />
      </ScrollView>
    </View>
  );
}

function iconByType(type: NotifType): keyof typeof Feather.glyphMap {
  if (type === "apply") return "send";
  if (type === "status") return "check-circle";
  return "bell";
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
    gap: 12,
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
    maxWidth: 260,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.soft,
  },
  markBtn: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    ...theme.shadow.soft,
  },
  markBtnDisabled: {
    opacity: 0.7,
  },
  markText: {
    color: theme.colors.primary2,
    fontSize: 13,
    fontWeight: "900",
  },
  inboxCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    ...theme.shadow.soft,
    overflow: "hidden",
  },
  row: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconUnread: {
    backgroundColor: "rgba(59,130,246,0.10)",
    borderColor: "rgba(59,130,246,0.22)",
  },
  iconRead: {
    backgroundColor: theme.colors.surface2,
    borderColor: theme.colors.stroke,
  },
  content: {
    flex: 1,
    minHeight: 40,
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 4,
  },
  rowTitle: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14.5,
    fontWeight: "800",
  },
  rowTitleUnread: {
    fontWeight: "900",
  },
  time: {
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "800",
  },
  body: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "bold",
    lineHeight: 18,
  },
  unreadDot: {
    position: "absolute",
    right: 2,
    top: 2,
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: theme.colors.primary,
  },
  divider: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 0,
    height: 1,
    backgroundColor: theme.colors.stroke,
  },
  footer: {
    marginTop: theme.spacing.lg,
    color: theme.colors.faint,
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 12,
  },
});