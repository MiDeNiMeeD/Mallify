import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  fonts,
} from "../theme";

const DeliveryDetailsScreen = ({ route, navigation }) => {
  console.log("📋 DeliveryDetailsScreen rendered");
  console.log("📦 Route params:", route.params);

  const { delivery } = route.params;
  console.log("📦 Delivery data:", delivery);

  const [deliveryStatus, setDeliveryStatus] = useState(delivery.status);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    icon: "checkmark-circle",
    iconColor: "#4CAF50",
    buttons: [],
    issueOptions: null,
  });
  const [selectedIssue, setSelectedIssue] = useState(null);

  const showModal = (config) => {
    setModalConfig(config);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleStartDelivery = () => {
    console.log("▶️ Starting delivery:", delivery.id);
    setDeliveryStatus("in-progress");
    showModal({
      title: "Delivery Started",
      message: "Navigation to destination activated",
      icon: "checkmark-circle",
      iconColor: "#70B2B2",
      buttons: [
        {
          text: "OK",
          onPress: closeModal,
          style: "primary",
        },
      ],
    });
  };

  const handleMarkDelivered = () => {
    setDeliveryStatus("delivered");
    showModal({
      title: "Success",
      message: "Delivery marked as completed!",
      icon: "checkmark-done-circle",
      iconColor: "#4CAF50",
      buttons: [
        {
          text: "OK",
          onPress: () => {
            closeModal();
            navigation.goBack();
          },
          style: "primary",
        },
      ],
    });
  };

  const handleCancelOrder = () => {
    showModal({
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order?",
      icon: "close-circle",
      iconColor: "#FF3B30",
      buttons: [
        {
          text: "No",
          onPress: closeModal,
          style: "secondary",
        },
        {
          text: "Yes, Cancel",
          onPress: () => {
            setDeliveryStatus("cancelled");
            closeModal();
            setTimeout(() => {
              showModal({
                title: "Order Cancelled",
                message: "Order has been cancelled",
                icon: "checkmark-circle",
                iconColor: "#FF3B30",
                buttons: [
                  {
                    text: "OK",
                    onPress: () => {
                      closeModal();
                      navigation.goBack();
                    },
                    style: "primary",
                  },
                ],
              });
            }, 300);
          },
          style: "danger",
        },
      ],
    });
  };

  const handleReturnOrder = () => {
    showModal({
      title: "Return Order",
      message: "Mark this order for return?",
      icon: "arrow-undo-circle",
      iconColor: "#FF9800",
      buttons: [
        {
          text: "No",
          onPress: closeModal,
          style: "secondary",
        },
        {
          text: "Yes, Return",
          onPress: () => {
            setDeliveryStatus("returned");
            closeModal();
            setTimeout(() => {
              showModal({
                title: "Order Returned",
                message: "Order marked for return",
                icon: "checkmark-circle",
                iconColor: "#FF9800",
                buttons: [
                  {
                    text: "OK",
                    onPress: () => {
                      closeModal();
                      navigation.goBack();
                    },
                    style: "primary",
                  },
                ],
              });
            }, 300);
          },
          style: "warning",
        },
      ],
    });
  };

  const handleReportIssue = () => {
    const issueTypes = [
      { id: 1, label: "Customer not available", icon: "person-remove" },
      { id: 2, label: "Wrong address", icon: "location-outline" },
      { id: 3, label: "Access denied", icon: "lock-closed" },
      { id: 4, label: "Package damaged", icon: "alert-circle" },
      { id: 5, label: "Other", icon: "ellipsis-horizontal" },
    ];

    setSelectedIssue(null);
    showModal({
      title: "Report Issue",
      message: "Select the issue type:",
      icon: "warning",
      iconColor: "#FF9800",
      issueOptions: issueTypes,
      buttons: [
        {
          text: "Cancel",
          onPress: closeModal,
          style: "secondary",
        },
        {
          text: "Submit",
          onPress: () => {
            if (selectedIssue) {
              const issue = issueTypes.find((i) => i.id === selectedIssue);
              closeModal();
              setTimeout(() => {
                showModal({
                  title: "Issue Reported",
                  message: `Issue "${issue.label}" has been reported successfully.`,
                  icon: "checkmark-circle",
                  iconColor: "#4CAF50",
                  buttons: [
                    {
                      text: "OK",
                      onPress: closeModal,
                      style: "primary",
                    },
                  ],
                });
              }, 300);
            }
          },
          style: "warning",
        },
      ],
    });
  };

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
        return "Pending - Ready to Start";
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

  const openDirections = () => {
    const destination = `${delivery.destination.latitude},${delivery.destination.longitude}`;
    let url;
    if (Platform.OS === "ios") {
      url = `http://maps.apple.com/?daddr=${destination}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    }
    Linking.openURL(url);
  };

  const callCustomer = () => {
    showModal({
      title: "Call Customer",
      message: `Call ${delivery.customerName}?`,
      icon: "call",
      iconColor: "#70B2B2",
      buttons: [
        {
          text: "Cancel",
          onPress: closeModal,
          style: "secondary",
        },
        {
          text: "Call",
          onPress: () => {
            closeModal();
            Linking.openURL("tel:+21612345678");
          },
          style: "primary",
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(deliveryStatus) + "20" },
            ]}
          >
            <Ionicons
              name={getStatusIcon(deliveryStatus)}
              size={20}
              color={getStatusColor(deliveryStatus)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(deliveryStatus) },
              ]}
            >
              {getStatusText(deliveryStatus)}
            </Text>
          </View>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>ORDER ID</Text>
            <Text style={styles.orderIdText}>{delivery.id}</Text>
          </View>
        </View>

        {/* Customer Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={20} color="#70B2B2" />
            <Text style={styles.cardTitle}>Customer Details</Text>
          </View>
          <View style={styles.customerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {delivery.customerName.charAt(0)}
              </Text>
            </View>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{delivery.customerName}</Text>
              <TouchableOpacity
                style={styles.callButton}
                onPress={callCustomer}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={14} color="#70B2B2" />
                <Text style={styles.callButtonText}>Call Customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Package Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={20} color="#70B2B2" />
            <Text style={styles.cardTitle}>Package Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="cube-outline" size={18} color="#70B2B2" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Packages</Text>
                <Text style={styles.infoValue}>{delivery.packageCount}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="time-outline" size={18} color="#9ECFD4" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Est. Time</Text>
                <Text style={styles.infoValue}>{delivery.estimatedTime}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={20} color="#70B2B2" />
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>
          <View style={styles.addressContainer}>
            <View style={styles.addressIconContainer}>
              <Ionicons name="navigate" size={20} color="#70B2B2" />
            </View>
            <Text style={styles.addressText}>{delivery.address}</Text>
          </View>
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={openDirections}
            activeOpacity={0.8}
          >
            <Ionicons name="map" size={18} color="#fff" />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        {/* Delivery Notes */}
        {delivery.notes && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={20} color="#70B2B2" />
              <Text style={styles.cardTitle}>Delivery Notes</Text>
            </View>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{delivery.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {deliveryStatus === "assigned" && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartDelivery}
              activeOpacity={0.8}
            >
              <Ionicons name="play-circle" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Start Delivery</Text>
            </TouchableOpacity>
          )}

          {deliveryStatus === "in-progress" && (
            <>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleMarkDelivered}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Mark as Delivered</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelOrder}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={20} color="#FF3B30" />
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.returnButton}
                onPress={handleReturnOrder}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-undo" size={20} color="#FF9800" />
                <Text style={styles.returnButtonText}>Return Order</Text>
              </TouchableOpacity>
            </>
          )}

          {deliveryStatus !== "delivered" &&
            deliveryStatus !== "cancelled" &&
            deliveryStatus !== "returned" && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleReportIssue}
                activeOpacity={0.8}
              >
                <Ionicons name="warning" size={20} color="#FF9800" />
                <Text style={styles.secondaryButtonText}>Report Issue</Text>
              </TouchableOpacity>
            )}

          {deliveryStatus === "delivered" && (
            <View style={styles.completedContainer}>
              <Ionicons
                name="checkmark-done-circle"
                size={48}
                color="#4CAF50"
              />
              <Text style={styles.completedText}>Delivery Completed</Text>
              <Text style={styles.completedSubtext}>
                Thank you for your service!
              </Text>
            </View>
          )}

          {deliveryStatus === "cancelled" && (
            <View style={styles.cancelledContainer}>
              <Ionicons name="close-circle" size={48} color="#FF3B30" />
              <Text style={styles.cancelledText}>Order Cancelled</Text>
              <Text style={styles.cancelledSubtext}>
                This order has been cancelled
              </Text>
            </View>
          )}

          {deliveryStatus === "returned" && (
            <View style={styles.returnedContainer}>
              <Ionicons name="arrow-undo-circle" size={48} color="#FF9800" />
              <Text style={styles.returnedText}>Order Returned</Text>
              <Text style={styles.returnedSubtext}>
                This order is marked for return
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Custom Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalIconContainer,
                { backgroundColor: modalConfig.iconColor + "20" },
              ]}
            >
              <Ionicons
                name={modalConfig.icon}
                size={48}
                color={modalConfig.iconColor}
              />
            </View>

            <Text style={styles.modalTitle}>{modalConfig.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig.message}</Text>

            {/* Issue Options */}
            {modalConfig.issueOptions && (
              <View style={styles.issueOptionsContainer}>
                {modalConfig.issueOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.issueOption,
                      selectedIssue === option.id && styles.issueOptionSelected,
                    ]}
                    onPress={() => setSelectedIssue(option.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.issueOptionContent}>
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={
                          selectedIssue === option.id
                            ? "#FF9800"
                            : colors.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.issueOptionText,
                          selectedIssue === option.id &&
                            styles.issueOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {selectedIssue === option.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#FF9800"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalButtonsContainer}>
              {modalConfig.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalButton,
                    button.style === "primary" && styles.modalButtonPrimary,
                    button.style === "secondary" && styles.modalButtonSecondary,
                    button.style === "danger" && styles.modalButtonDanger,
                    button.style === "warning" && styles.modalButtonWarning,
                  ]}
                  onPress={button.onPress}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.modalButtonText,
                      button.style === "primary" &&
                        styles.modalButtonTextPrimary,
                      button.style === "secondary" &&
                        styles.modalButtonTextSecondary,
                      button.style === "danger" && styles.modalButtonTextDanger,
                      button.style === "warning" &&
                        styles.modalButtonTextWarning,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
    ...shadows.small,
    marginTop: StatusBar.currentHeight || 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.h3,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  // Status Card
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.medium,
    alignSelf: "flex-start",
    marginBottom: spacing.md,
  },
  statusText: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 13,
    fontWeight: "600",
  },
  orderIdContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderIdLabel: {
    fontFamily: fonts.poppinsMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderIdText: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  // Card Styles
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  // Customer Info
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#70B2B2",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.poppinsBold,
    fontSize: 22,
    color: colors.white,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
  },
  callButtonText: {
    fontFamily: fonts.poppinsMedium,
    fontSize: 13,
    color: "#70B2B2",
  },
  // Package Info Grid
  infoGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F9F9",
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  // Address Section
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F5F9F9",
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addressIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#70B2B2",
    alignItems: "center",
    justifyContent: "center",
  },
  addressText: {
    flex: 1,
    fontFamily: fonts.poppinsRegular,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    paddingTop: 6,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#70B2B2",
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
  },
  directionsButtonText: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 14,
    color: colors.white,
  },
  // Notes Section
  notesContainer: {
    backgroundColor: "#FFF9E6",
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderLeftWidth: 3,
    borderLeftColor: "#FFB800",
  },
  notesText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  // Action Buttons
  actionsContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#70B2B2",
    borderRadius: borderRadius.large,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    minHeight: 54,
    ...shadows.medium,
  },
  primaryButtonText: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 15,
    color: colors.white,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: "#FF3B30",
    borderRadius: borderRadius.large,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    minHeight: 54,
  },
  cancelButtonText: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 15,
    color: "#FF3B30",
  },
  returnButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: "#FF9800",
    borderRadius: borderRadius.large,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    minHeight: 54,
  },
  returnButtonText: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 15,
    color: "#FF9800",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: "#FF9800",
    borderRadius: borderRadius.large,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    minHeight: 54,
  },
  secondaryButtonText: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 15,
    color: "#FF9800",
  },
  // Completed State
  completedContainer: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: "#F0F9F4",
    borderRadius: borderRadius.large,
    gap: spacing.sm,
  },
  completedText: {
    fontFamily: fonts.poppinsBold,
    fontSize: 18,
    color: "#4CAF50",
  },
  completedSubtext: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Cancelled State
  cancelledContainer: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: "#FFF5F5",
    borderRadius: borderRadius.large,
    gap: spacing.sm,
  },
  cancelledText: {
    fontFamily: fonts.poppinsBold,
    fontSize: 18,
    color: "#FF3B30",
  },
  cancelledSubtext: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Returned State
  returnedContainer: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: "#FFF9E6",
    borderRadius: borderRadius.large,
    gap: spacing.sm,
  },
  returnedText: {
    fontFamily: fonts.poppinsBold,
    fontSize: 18,
    color: "#FF9800",
  },
  returnedSubtext: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    ...shadows.large,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontFamily: fonts.poppinsBold,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  modalMessage: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  modalButtonPrimary: {
    backgroundColor: "#70B2B2",
  },
  modalButtonSecondary: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.backgroundSecondary,
  },
  modalButtonDanger: {
    backgroundColor: "#FF3B30",
  },
  modalButtonWarning: {
    backgroundColor: "#FF9800",
  },
  modalButtonText: {
    fontFamily: fonts.poppinsSemiBold,
    fontSize: 15,
  },
  modalButtonTextPrimary: {
    color: colors.white,
  },
  modalButtonTextSecondary: {
    color: colors.textPrimary,
  },
  modalButtonTextDanger: {
    color: colors.white,
  },
  modalButtonTextWarning: {
    color: colors.white,
  },
  // Issue Options
  issueOptionsContainer: {
    width: "100%",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  issueOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: borderRadius.medium,
    borderWidth: 2,
    borderColor: colors.backgroundSecondary,
    backgroundColor: colors.white,
  },
  issueOptionSelected: {
    borderColor: "#FF9800",
    backgroundColor: "#FF980020",
  },
  issueOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  issueOptionText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  issueOptionTextSelected: {
    fontFamily: fonts.poppinsSemiBold,
    color: "#FF9800",
  },
});

export default DeliveryDetailsScreen;
