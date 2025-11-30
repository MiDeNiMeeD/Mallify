import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing, fonts } from "../theme";

const ProfileScreen = ({ navigation }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    // Add a small delay before navigating for better UX
    setTimeout(() => {
      navigation.navigate("Login");
    }, 300);
  };

  const profileMenuItems = [
    {
      id: 1,
      title: "Edit Profile",
      icon: "person-outline",
      iconType: "ionicons",
      onPress: () => {
        navigation.navigate("EditProfile");
      },
    },
    {
      id: 2,
      title: "Address",
      icon: "location-outline",
      iconType: "ionicons",
      onPress: () => {
        navigation.navigate("Address");
      },
    },
    {
      id: 3,
      title: "Notification",
      icon: "notifications-outline",
      iconType: "ionicons",
      onPress: () => {
        navigation.navigate("Notification");
      },
    },

    {
      id: 6,
      title: "Language",
      icon: "language-outline",
      iconType: "ionicons",
      rightText: "English (US)",
      onPress: () => {
        // Navigate to language selection
      },
    },
    {
      id: 7,
      title: "Dark Mode",
      icon: "moon-outline",
      iconType: "ionicons",
      hasSwitch: true,
      onPress: () => {
        // Toggle dark mode
      },
    },

    {
      id: 9,
      title: "Driver Service",
      icon: "chatbox-ellipses-outline",
      iconType: "ionicons",
      onPress: () => {
        navigation.navigate("DriverService");
      },
    },

    {
      id: 11,
      title: "Logout",
      icon: "log-out-outline",
      iconType: "ionicons",
      isLogout: true,
      onPress: () => {
        setShowLogoutModal(true);
      },
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, item.isLogout && styles.logoutItem]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.iconContainer,
            item.isLogout && styles.logoutIconContainer,
          ]}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.isLogout ? colors.error : colors.textSecondary}
          />
        </View>
        <Text style={[styles.menuItemText, item.isLogout && styles.logoutText]}>
          {item.title}
        </Text>
      </View>

      <View style={styles.menuItemRight}>
        {item.rightText && (
          <Text style={styles.rightText}>{item.rightText}</Text>
        )}
        {!item.hasSwitch && !item.isLogout && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textSecondary}
          />
        )}
        {item.hasSwitch && (
          <View style={styles.switchContainer}>
            {/* You can replace this with a proper switch component */}
            <View style={styles.switchTrack}>
              <View style={styles.switchThumb} />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: "https://scontent.ftun1-2.fna.fbcdn.net/v/t39.30808-1/470468285_1609345313014084_246144399086604_n.jpg?stp=dst-jpg_p160x160_tt6&_nc_cat=105&ccb=1-7&_nc_sid=28885b&_nc_ohc=P-s65qfjS1YQ7kNvwHKDQb0&_nc_oc=Adnq0XHSqeAshpFqr54mCSPmtzkM7BbTMVQ2NMcKaDnq8OYk1Q7J-YbBTG3NvLJvCCg&_nc_zt=24&_nc_ht=scontent.ftun1-2.fna&_nc_gid=GZqvRY8aQmMvibK7QFEszA&oh=00_AffW23NsePHbTazVNdcD_yHrCLY6xJq52vVr63T7Oyy-Pg&oe=68F1B490",
              }}
              style={styles.profileImage}
            />
          </View>

          <Text style={styles.profileName}>Mideni Med</Text>
          <Text style={styles.profilePhone}>24 905 669</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {profileMenuItems.map(renderMenuItem)}
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Logout</Text>
            </View>

            <Text style={styles.modalMessage}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Yes, Logout</Text>
              </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
    marginTop: StatusBar.currentHeight || 0,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    lineHeight: 40,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 50,
    backgroundColor: colors.backgroundSecondary,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#016B61",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileName: {
    fontSize: 20,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  profilePhone: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
  },
  menuSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: spacing.sm,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  logoutIconContainer: {},
  menuItemText: {
    fontSize: 16,
    fontFamily: fonts.poppinsMedium,
    color: colors.textPrimary,
  },
  logoutText: {
    color: colors.error,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightText: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  switchContainer: {
    marginLeft: spacing.sm,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignSelf: "flex-start", // Change to flex-end when switched on
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    width: "100%",
    alignItems: "center",
  },
  modalHeader: {
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.poppinsBold,
    color: colors.error,
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: fonts.poppinsMedium,
    color: colors.textPrimary,
  },
  logoutButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    backgroundColor: "#016B61",
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 15,
    fontFamily: fonts.poppinsMedium,
    color: colors.white,
  },
});

export default ProfileScreen;
