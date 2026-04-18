import React from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { logout } from "../../src/services/auth";

export default function AdminDashboardScreen() {
  const handleLogout = () => {
    Alert.alert("Déconnexion", "Veux-tu vraiment te déconnecter ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <View style={styles.heroIcon}>
              <Feather name="shield" size={24} color="#2563EB" />
            </View>

            <View>
              <Text style={styles.title}>Admin Panel</Text>
              <Text style={styles.subtitle}>
                Vérifie les entreprises et valide les dossiers.
              </Text>
            </View>
          </View>

          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={18} color="#DC2626" />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Espace d’administration</Text>
          <Text style={styles.heroText}>
            Depuis ici, tu peux consulter les entreprises en attente, ouvrir les
            documents envoyés, puis approuver ou rejeter chaque demande.
          </Text>
        </View>

        <Pressable
          style={styles.primaryCard}
          onPress={() => router.push("/(admin-tabs)/companies")}
        >
          <View style={styles.cardIcon}>
            <Feather name="briefcase" size={20} color="#2563EB" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Entreprises à vérifier</Text>
            <Text style={styles.cardText}>
              Ouvre la liste des entreprises en attente de validation.
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#94A3B8" />
        </Pressable>

        <Pressable style={styles.logoutCard} onPress={handleLogout}>
          <View style={styles.logoutCardIcon}>
            <Feather name="log-out" size={18} color="#DC2626" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.logoutCardTitle}>Se déconnecter</Text>
            <Text style={styles.logoutCardText}>
              Quitter la session admin en toute sécurité.
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#94A3B8" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    padding: 18,
    gap: 16,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  topLeft: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 6,
    color: "#475569",
    lineHeight: 21,
  },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  heroText: {
    marginTop: 8,
    color: "#475569",
    lineHeight: 22,
  },
  primaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  cardText: {
    marginTop: 4,
    color: "#64748B",
    lineHeight: 20,
  },
  logoutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoutCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutCardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#991B1B",
  },
  logoutCardText: {
    marginTop: 4,
    color: "#7F1D1D",
    lineHeight: 20,
  },
});