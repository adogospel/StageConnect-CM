export const theme = {
  colors: {
    bg: "#F6F8FC",
    surface: "#FFFFFF",
    surface2: "#F1F4FA",
    stroke: "rgba(18, 23, 38, 0.10)",
    stroke2: "rgba(18, 23, 38, 0.14)",
    text: "#0F172A",
    muted: "rgba(15, 23, 42, 0.72)",
    faint: "rgba(15, 23, 42, 0.50)",
    primary: "#3B82F6",   // bleu premium
    primary2: "#6366F1",  // indigo
    danger: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
  },
  radius: { sm: 12, md: 16, lg: 22, xl: 28 },
  spacing: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 },
  shadow: {
    soft: {
      shadowColor: "#0B1220",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.10,
      shadowRadius: 18,
      elevation: 8,
    },
  },
  text: {
    h1: { fontSize: 30, fontWeight: "900" as const, letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: "900" as const, letterSpacing: -0.2 },
    body: { fontSize: 15, fontWeight: "600" as const },
    small: { fontSize: 13, fontWeight: "600" as const },
  },
};