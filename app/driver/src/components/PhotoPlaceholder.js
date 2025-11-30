import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, spacing, typography, borderRadius } from "../theme";

const PhotoPlaceholder = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>📷</Text>
      <Text style={styles.text}>Tap to upload photo</Text>
      <Text style={styles.subtitle}>Proof of delivery</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});

export default PhotoPlaceholder;
