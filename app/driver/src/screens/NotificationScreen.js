import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fonts } from "../theme";

const notifications = [
  {
    id: 1,
    title: "30% Special Discount!",
    description: "Special promotion only until today",
    type: "discount",
    icon: "pricetag",
    time: "Today",
    read: false,
  },
  {
    id: 2,
    title: "Top Up E-Wallet Successful!",
    description: "You have to top up your e-wallet",
    type: "wallet",
    icon: "wallet",
    time: "Yesterday",
    read: false,
  },
  {
    id: 3,
    title: "New Services Available!",
    description: "Now you can track orders in real time",
    type: "service",
    icon: "notifications",
    time: "Yesterday",
    read: false,
  },
  {
    id: 4,
    title: "Credit Card Connected!",
    description: "Credit Card has been linked",
    type: "payment",
    icon: "card",
    time: "December 22, 2024",
    read: true,
  },
  {
    id: 5,
    title: "Account Setup Successful!",
    description: "Your account has been created",
    type: "account",
    icon: "person",
    time: "December 22, 2024",
    read: true,
  },
];

// Group notifications by date
const groupNotificationsByDate = (notifications) => {
  const groups = {};

  notifications.forEach((notification) => {
    const date = notification.time;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
  });

  return groups;
};

export default function NotificationScreen({ navigation }) {
  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleNotificationPress = (notificationId) => {
    console.log("Notification pressed:", notificationId);
    // Handle notification tap
  };

  const getIconColor = (type, read) => {
    if (read) return colors.textSecondary;

    switch (type) {
      case "discount":
        return "#FF6B6B";
      case "wallet":
        return "#4ECDC4";
      case "service":
        return "#45B7D1";
      case "payment":
        return "#96CEB4";
      case "account":
        return "#FFEAA7";
      default:
        return colors.textPrimary;
    }
  };

  const getBackgroundColor = (type, read) => {
    if (read) return "#F5F5F5";

    switch (type) {
      case "discount":
        return "#FFE5E5";
      case "wallet":
        return "#E5F9F7";
      case "service":
        return "#E5F4FD";
      case "payment":
        return "#E5F5ED";
      case "account":
        return "#FEF9E5";
      default:
        return colors.backgroundSecondary;
    }
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedNotifications).map(
          ([date, dateNotifications]) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{date}</Text>

              {dateNotifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={styles.notificationItem}
                  onPress={() => handleNotificationPress(notification.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: getBackgroundColor(
                          notification.type,
                          notification.read
                        ),
                      },
                    ]}
                  >
                    <Ionicons
                      name={notification.icon}
                      size={24}
                      color={getIconColor(notification.type, notification.read)}
                    />
                  </View>

                  <View style={styles.notificationContent}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        {
                          color: notification.read
                            ? colors.textSecondary
                            : colors.textPrimary,
                        },
                      ]}
                    >
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationDescription}>
                      {notification.description}
                    </Text>
                  </View>

                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
    marginTop: StatusBar.currentHeight || 0,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  dateSection: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    fontSize: 16,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: fonts.poppinsSemiBold,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
    marginLeft: spacing.sm,
  },
});
