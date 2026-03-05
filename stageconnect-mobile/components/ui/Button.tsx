import React from "react";
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../../constants/theme";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  style?: ViewStyle;
};

export default function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === "primary" ? styles.primary : styles.ghost,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={[styles.text, variant === "ghost" ? styles.textGhost : null]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: theme.radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadow.soft,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.stroke2,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  textGhost: {
    color: theme.colors.text,
  },
});