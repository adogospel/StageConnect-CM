import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const LOGO_SOURCE = require("../assets/images/LOGO.png");

const CIRCLE_SIZE = 126;

// ─── Tiny helper: spring with sane defaults ───────────────────────────────────
function spring(
  node: Animated.Value,
  toValue: number,
  friction = 6,
  tension = 70
) {
  return Animated.spring(node, {
    toValue,
    friction,
    tension,
    useNativeDriver: true,
  });
}

function timing(
  node: Animated.Value,
  toValue: number,
  duration: number,
  easing: ((t: number) => number) = Easing.out(Easing.cubic)
) {
  return Animated.timing(node, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
}

export default function AppSplash() {
  // ── Phase 1 : intro pop ──────────────────────────────────────────────────
  const introScale   = useRef(new Animated.Value(0.72)).current;
  const introOpacity = useRef(new Animated.Value(0)).current;

  // ── Spinning rings ───────────────────────────────────────────────────────
  const ringRotate        = useRef(new Animated.Value(0)).current;
  const ringRotateReverse = useRef(new Animated.Value(0)).current;
  const ringThirdRotate   = useRef(new Animated.Value(0)).current; // ← NEW decorative ring

  // ── Glow pulse around the circle ────────────────────────────────────────
  const glowScale   = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  // ── Orbiting dot ────────────────────────────────────────────────────────
  const orbitAngle = useRef(new Animated.Value(0)).current;

  // ── Particle dots (4 staggered pulses) ──────────────────────────────────
  const particleScales   = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const particleOpacities = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  // ── White wipe ───────────────────────────────────────────────────────────
  const whiteCircleScale = useRef(new Animated.Value(0)).current;

  // ── Center logo exit ────────────────────────────────────────────────────
  const centerLogoOpacity = useRef(new Animated.Value(1)).current;
  const centerLogoScale   = useRef(new Animated.Value(1)).current;

  // ── Final brand reveal ───────────────────────────────────────────────────
  const finalLogoOpacity      = useRef(new Animated.Value(0)).current;
  const finalLogoTranslate    = useRef(new Animated.Value(28)).current;
  const finalLogoScale        = useRef(new Animated.Value(0.88)).current;
  const finalTextOpacity      = useRef(new Animated.Value(0)).current;
  const finalTextTranslate    = useRef(new Animated.Value(22)).current;
  const finalSubOpacity       = useRef(new Animated.Value(0)).current;
  const finalSubTranslate     = useRef(new Animated.Value(14)).current;
  const finalLogoBorderAnim   = useRef(new Animated.Value(0)).current; // shimmer border

  useEffect(() => {
    // ── 1. Intro pop ─────────────────────────────────────────────────────
    Animated.parallel([
      timing(introOpacity, 1, 400),
      spring(introScale, 1, 5, 80),
    ]).start();

    // ── 2. Continuous ring rotations ─────────────────────────────────────
    Animated.loop(
      timing(ringRotate, 1, 1450, Easing.linear)
    ).start();

    Animated.loop(
      timing(ringRotateReverse, 1, 1900, Easing.linear)
    ).start();

    Animated.loop(
      timing(ringThirdRotate, 1, 2600, Easing.linear)
    ).start();

    // ── 3. Pulsing glow ──────────────────────────────────────────────────
    timing(glowOpacity, 0.55, 600).start();
    Animated.loop(
      Animated.sequence([
        timing(glowScale, 1.22, 900, Easing.inOut(Easing.sin)),
        timing(glowScale, 1.0,  900, Easing.inOut(Easing.sin)),
      ])
    ).start();

    // ── 4. Orbiting dot ──────────────────────────────────────────────────
    Animated.loop(
      timing(orbitAngle, 1, 2200, Easing.linear)
    ).start();

    // ── 5. Particle bursts (staggered) ────────────────────────────────────
    const PARTICLE_ANGLES = [0, 90, 180, 270]; // degrees – just for visual variety
    particleScales.forEach((s, i) => {
      const loop = () => {
        Animated.sequence([
          Animated.delay(i * 340),
          Animated.parallel([
            timing(s, 1.5, 550, Easing.out(Easing.cubic)),
            timing(particleOpacities[i], 1, 220, Easing.out(Easing.cubic)),
          ]),
          Animated.parallel([
            timing(s, 0, 430, Easing.in(Easing.cubic)),
            timing(particleOpacities[i], 0, 300, Easing.in(Easing.cubic)),
          ]),
          Animated.delay(Math.max(0, 1360 - 550 - 430 - 340 * i)),
        ]).start(({ finished }) => { if (finished) loop(); });
      };
      loop();
    });

    // ── 6. Transition sequence (after 1 450 ms hold) ─────────────────────
    const timer = setTimeout(() => {
      Animated.sequence([
        // Micro‑press on logo
        Animated.parallel([
          timing(centerLogoScale, 0.88, 160, Easing.out(Easing.cubic)),
          timing(whiteCircleScale, 1, 160, Easing.out(Easing.cubic)),
        ]),

        // White circle expands, logo fades away
        Animated.parallel([
          timing(whiteCircleScale, 16, 760, Easing.inOut(Easing.cubic)),
          timing(centerLogoOpacity, 0, 380, Easing.out(Easing.cubic)),
          timing(centerLogoScale, 0.68, 560, Easing.out(Easing.cubic)),
          timing(glowOpacity, 0, 300, Easing.out(Easing.cubic)),
        ]),

        Animated.delay(80),

        // Final brand slides in with staggered children
        Animated.parallel([
          // Logo box
          timing(finalLogoOpacity, 1, 480, Easing.out(Easing.cubic)),
          timing(finalLogoTranslate, 0, 500, Easing.out(Easing.cubic)),
          spring(finalLogoScale, 1, 5, 75),

          // Title (slight delay)
          Animated.sequence([
            Animated.delay(80),
            Animated.parallel([
              timing(finalTextOpacity, 1, 500, Easing.out(Easing.cubic)),
              timing(finalTextTranslate, 0, 500, Easing.out(Easing.cubic)),
            ]),
          ]),

          // Subtitle (more delay)
          Animated.sequence([
            Animated.delay(180),
            Animated.parallel([
              timing(finalSubOpacity, 1, 520, Easing.out(Easing.cubic)),
              timing(finalSubTranslate, 0, 520, Easing.out(Easing.cubic)),
            ]),
          ]),

          // Logo box border shimmer
          Animated.sequence([
            Animated.delay(400),
            Animated.loop(
              Animated.sequence([
                timing(finalLogoBorderAnim, 1, 1200, Easing.inOut(Easing.sin)),
                timing(finalLogoBorderAnim, 0, 1200, Easing.inOut(Easing.sin)),
              ])
            ),
          ]),
        ]),
      ]).start();
    }, 1450);

    return () => clearTimeout(timer);
  }, []);

  // ── Interpolations ───────────────────────────────────────────────────────
  const rotate = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const reverseRotate = ringRotateReverse.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"],
  });
  const thirdRotate = ringThirdRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Orbiting dot – translate on a circle of radius ~64
  const ORBIT_RADIUS = 64;
  const orbitX = orbitAngle.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 2 * Math.PI],
  });

  // We compute x/y via interpolate chained trick
  const orbitTranslateX = orbitAngle.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      ORBIT_RADIUS,
      0,
      -ORBIT_RADIUS,
      0,
      ORBIT_RADIUS,
    ],
  });
  const orbitTranslateY = orbitAngle.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, ORBIT_RADIUS, 0, -ORBIT_RADIUS, 0],
  });

  // Particle positions (fixed spots around the circle)
  const PARTICLE_POSITIONS = [
    { x: -55, y: -30 },
    { x: 55,  y: -30 },
    { x: 55,  y: 30  },
    { x: -55, y: 30  },
  ];

  return (
    <View style={styles.screen}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#F6F8FC", "#EAF2FF", "#DCEBFF"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle radial background glow behind the whole scene */}
      <View style={styles.bgGlowOuter} pointerEvents="none" />

      {/* White wipe circle */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.whiteWipe,
          { transform: [{ scale: whiteCircleScale }] },
        ]}
      />

      {/* ── Phase 1 & 2 center content ── */}
      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: introOpacity,
            transform: [{ scale: introScale }],
          },
        ]}
      >
        {/* Pulsing glow halo */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowHalo,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* Particle dots */}
        {PARTICLE_POSITIONS.map((pos, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[
              styles.particle,
              {
                opacity: particleOpacities[i],
                transform: [
                  { translateX: pos.x },
                  { translateY: pos.y },
                  { scale: particleScales[i] },
                ],
              },
            ]}
          />
        ))}

        {/* Orbiting dot */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.orbitDot,
            {
              transform: [
                { translateX: orbitTranslateX },
                { translateY: orbitTranslateY },
              ],
            },
          ]}
        />

        {/* Main logo circle */}
        <Animated.View
          style={[
            styles.logoCircle,
            {
              opacity: centerLogoOpacity,
              transform: [{ scale: centerLogoScale }],
            },
          ]}
        >
          {/* Outer spinning ring */}
          <Animated.View
            style={[
              styles.outerRing,
              { transform: [{ rotate }] },
            ]}
          />

          {/* Inner reverse ring */}
          <Animated.View
            style={[
              styles.innerRing,
              { transform: [{ rotate: reverseRotate }] },
            ]}
          />

          {/* Third decorative ring (dashed-style via opacity gaps) */}
          <Animated.View
            style={[
              styles.thirdRing,
              { transform: [{ rotate: thirdRotate }] },
            ]}
          />

          {/* Logo */}
          <View style={styles.logoInner}>
            <Image
              source={LOGO_SOURCE}
              style={styles.centerLogo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </Animated.View>

      {/* ── Phase 3 : final brand reveal ── */}
      <View style={styles.finalBrandWrap}>
        <Animated.View
          style={[
            styles.finalLogoBox,
            {
              opacity: finalLogoOpacity,
              transform: [
                { translateX: finalLogoTranslate },
                { scale: finalLogoScale },
              ],
            },
          ]}
        >
          {/* Inner gradient shimmer on the logo box */}
          <LinearGradient
            colors={["#EEF4FF", "#DDEEFF", "#EEF4FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Image
            source={LOGO_SOURCE}
            style={styles.finalLogo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Text stack */}
        <View style={styles.finalTextStack}>
          <Animated.View
            style={{
              opacity: finalTextOpacity,
              transform: [{ translateX: finalTextTranslate }],
            }}
          >
            <Text style={styles.finalTitle}>StageConnect CM</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: finalSubOpacity,
              transform: [{ translateX: finalSubTranslate }],
            }}
          >
            {/* Pill subtitle */}
            <View style={styles.subtitlePill}>
              <View style={styles.subtitleDot} />
              <Text style={styles.finalSubtitle}>
                Emplois • Stages • Recrutement
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  // ── Background glow ──────────────────────────────────────────────────────
  bgGlowOuter: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#C7DCFF",
    opacity: 0.22,
    // Soft radial feel via a large blur (supported on iOS; on Android it degrades gracefully)
  },

  // ── White wipe ───────────────────────────────────────────────────────────
  whiteWipe: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#FFFFFF",
    zIndex: 2,
  },

  // ── Center scene ─────────────────────────────────────────────────────────
  centerContent: {
    position: "absolute",
    zIndex: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  glowHalo: {
    position: "absolute",
    width: CIRCLE_SIZE + 36,
    height: CIRCLE_SIZE + 36,
    borderRadius: (CIRCLE_SIZE + 36) / 2,
    backgroundColor: "#2563EB",
    opacity: 0,   // driven by animated value
  },

  particle: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#60A5FA",
  },

  orbitDot: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },

  logoCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E40AF",
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },

  outerRing: {
    position: "absolute",
    width: CIRCLE_SIZE - 8,
    height: CIRCLE_SIZE - 8,
    borderRadius: (CIRCLE_SIZE - 8) / 2,
    borderWidth: 5,
    borderTopColor: "#2563EB",
    borderRightColor: "transparent",
    borderBottomColor: "#60A5FA",
    borderLeftColor: "transparent",
  },

  innerRing: {
    position: "absolute",
    width: CIRCLE_SIZE - 24,
    height: CIRCLE_SIZE - 24,
    borderRadius: (CIRCLE_SIZE - 24) / 2,
    borderWidth: 4,
    borderTopColor: "transparent",
    borderRightColor: "#93C5FD",
    borderBottomColor: "transparent",
    borderLeftColor: "#BFDBFE",
    opacity: 0.65,
  },

  // NEW: outermost subtle ring
  thirdRing: {
    position: "absolute",
    width: CIRCLE_SIZE + 4,
    height: CIRCLE_SIZE + 4,
    borderRadius: (CIRCLE_SIZE + 4) / 2,
    borderWidth: 1.5,
    borderTopColor: "#93C5FD",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#BFDBFE",
    opacity: 0.45,
  },

  logoInner: {
    width: 74,
    height: 74,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  centerLogo: {
    width: 64,
    height: 64,
  },

  // ── Final brand ──────────────────────────────────────────────────────────
  finalBrandWrap: {
    position: "absolute",
    zIndex: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    maxWidth: width - 48,
  },

  finalLogoBox: {
    width: 68,
    height: 68,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#C7D9FF",
    shadowColor: "#2563EB",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  finalLogo: {
    width: 46,
    height: 46,
  },

  finalTextStack: {
    flexShrink: 1,
    gap: 6,
  },

  finalTitle: {
    color: "#0F172A",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  subtitlePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#DDE8FF",
  },

  subtitleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#2563EB",
  },

  finalSubtitle: {
    color: "#3B6BE8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
