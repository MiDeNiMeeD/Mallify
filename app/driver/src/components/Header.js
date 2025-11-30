import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, spacing, typography, borderRadius } from "../theme";

const Header = ({ title, showBackButton = false, onBack, rightComponent }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showBackButton && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        {rightComponent && (
          <View style={styles.rightComponent}>{rightComponent}</View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  rightComponent: {
    marginLeft: spacing.sm,
  },
});

export default Header;
