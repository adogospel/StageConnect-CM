import React from "react";
import { View, Text, TextInput, TextInputProps, StyleSheet } from "react-native";
import { theme } from "../../constants/theme";
import { Feather } from "@expo/vector-icons";

type Props = TextInputProps & {
  label?: string;
  icon?: keyof typeof Feather.glyphMap;
  error?: string;
  right?: React.ReactNode;
};

export default function Input({ label, icon, error, right, style, ...props }: Props) {
  return (
    <View style={{ marginBottom: theme.spacing.md }}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.wrap, error ? styles.wrapError : null]}>
        {!!icon && (
          <View style={styles.iconLeft}>
            <Feather name={icon} size={18} color={theme.colors.faint} />
          </View>
        )}

        <TextInput
          placeholderTextColor={theme.colors.faint}
          style={[styles.input, style]}
          {...props}
        />

        {!!right && <View style={styles.right}>{right}</View>}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: theme.colors.muted,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  wrapError: {
    borderColor: "rgba(255,77,109,0.7)",
  },
  iconLeft: {
    width: 28,
    alignItems: "center",
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 0,
  },
  right: {
    marginLeft: 10,
  },
  error: {
    marginTop: 8,
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
});