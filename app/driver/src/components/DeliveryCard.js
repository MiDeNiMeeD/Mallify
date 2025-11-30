import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  fonts,
} from "../theme";

const DeliveryCard = ({ delivery, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "assigned":
      case "pending":
        return "#FF9800";
      case "in-progress":
      case "picked_up":
        return "#70B2B2";
      case "delivered":
        return "#4CAF50";
      default:
        return colors.gray;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "assigned":
      case "pending":
        return "Pending";
      case "in-progress":
        return "In Progress";
      case "picked_up":
        return "Picked Up";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "assigned":
      case "pending":
        return "time-outline";
      case "in-progress":
        return "bicycle-outline";
      case "picked_up":
        return "checkmark-circle-outline";
      case "delivered":
        return "checkmark-done-circle";
      default:
        return "ellipse-outline";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Status Indicator Bar */}
      <View
        style={[
          styles.statusBar,
          { backgroundColor: getStatusColor(delivery.status) },
        ]}
      />

      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.idLabel}>ORDER #{delivery.id}</Text>
            <Text style={styles.customerName}>{delivery.customerName}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(delivery.status) + "20" },
            ]}
          >
            <Ionicons
              name={getStatusIcon(delivery.status)}
              size={14}
              color={getStatusColor(delivery.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(delivery.status) },
              ]}
            >
              {getStatusText(delivery.status)}
            </Text>
          </View>
        </View>

        {/* Address */}
        <View style={styles.addressContainer}>
          <View style={styles.addressIconContainer}>
            <Ionicons name="location" size={18} color="#70B2B2" />
          </View>
          <Text style={styles.address} numberOfLines={2}>
            {delivery.address}
          </Text>
        </View>

        {/* Notes if available */}
        {delivery.notes && (
          <View style={styles.notesContainer}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text style={styles.notesText} numberOfLines={1}>
              {delivery.notes}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="cube-outline" size={16} color="#70B2B2" />
            <Text style={styles.footerText}>
              {delivery.packageCount}{" "}
              {delivery.packageCount === 1 ? "Package" : "Packages"}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={16} color="#9ECFD4" />
            <Text style={styles.footerText}>{delivery.estimatedTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadows.medium,
  },
  statusBar: {
    height: 4,
    width: "100%",
  },
  cardContent: {
    padding: spacing.lg,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  idLabel: {
    fontSize: 11,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 18,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.medium,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: fonts.poppinsSemiBold,
    fontWeight: "600",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F5F9F9",
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.sm,
  },
  addressIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
    ...shadows.small,
  },
  address: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    padding: spacing.sm,
    borderRadius: borderRadius.small,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  notesText: {
    flex: 1,
    fontSize: 11,
    fontFamily: fonts.poppinsRegular,
    color: "#8B7100",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundSecondary,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.sm,
  },
  footerText: {
    fontSize: 12,
    fontFamily: fonts.poppinsMedium,
    color: colors.textPrimary,
  },
  actionIndicator: {
    position: "absolute",
    right: spacing.md,
    top: "50%",
    marginTop: -10,
  },
});

export default DeliveryCard;
