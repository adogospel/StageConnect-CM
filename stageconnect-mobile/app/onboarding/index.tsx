import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

import { theme } from "../../constants/theme";

const { width } = Dimensions.get("window");

// ✅ Mets tes images Storyset ici
const slides = [
  {
    id: "1",
    title: "Trouve les bonnes opportunités",
    subtitle:
      "Découvre des offres d’emploi, de stage et d’alternance adaptées à ton profil.",
    image: require("../../assets/images/onboarding-1.png"),
  },
  {
    id: "2",
    title: "Postule plus rapidement",
    subtitle:
      "Envoie ta candidature avec ton profil, ton CV et tes compétences en quelques secondes.",
    image: require("../../assets/images/onboarding-2.png"),
  },
  {
    id: "3",
    title: "Suis ton parcours facilement",
    subtitle:
      "Garde le contrôle sur tes candidatures, tes notifications et tes échanges.",
    image: require("../../assets/images/onboarding-3.png"),
  },
];

export default function OnboardingScreen() {
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const finish = async () => {
    await AsyncStorage.setItem("sc_onboarding_seen", "true");
    router.replace("/(auth)/login");
  };

  const next = () => {
    if (index === slides.length - 1) {
      finish();
      return;
    }

    listRef.current?.scrollToIndex({
      index: index + 1,
      animated: true,
    });
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(nextIndex);
  };

  return (
    <LinearGradient
      colors={["#F6F8FC", "#EEF4FF", "#FFFFFF"]}
      style={styles.screen}
    >
      <View style={styles.progressWrap}>
        {slides.map((_, i) => (
          <View key={i} style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: i <= index ? "100%" : "0%",
                },
              ]}
            />
          </View>
        ))}
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.imageBox}>
              <Image source={item.image} style={styles.image} resizeMode="contain" />
            </View>

            <View style={styles.textBox}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable style={styles.button} onPress={next}>
          <Text style={styles.buttonText}>
            {index === slides.length - 1 ? "Commencer" : "Continuer"}
          </Text>
          <Feather
            name={index === slides.length - 1 ? "check" : "arrow-right"}
            size={18}
            color="#fff"
          />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  progressWrap: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 10,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#DCE6F5",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  imageBox: {
    height: 330,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textBox: {
    marginTop: 34,
    alignItems: "center",
  },
  title: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
    color: "#64748B",
    textAlign: "center",
    maxWidth: 330,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  button: {
    height: 56,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
});