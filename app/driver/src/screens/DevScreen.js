import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { colors, spacing, typography, borderRadius, shadows } from "../theme";

const devPages = [
  // 🚀 AUTHENTICATION FLOW
  {
    id: 0,
    name: "Splash Screen",
    route: "Splash",
    description: "✨ App loading screen with animated logo and dots",
    emoji: "⚡",
    category: "Auth",
  },
  {
    id: 1,
    name: "Onboarding Flow",
    route: "Onboarding",
    description: "✨ 4-screen onboarding with welcome and feature highlights",
    emoji: "👋",
    category: "Auth",
  },
  {
    id: 2,
    name: "Login Screen",
    route: "Login",
    description:
      "✨ Driver authentication with email/password and quick demo login",
    emoji: "🔐",
    category: "Auth",
  },
  {
    id: 3,
    name: "Sign In Screen",
    route: "SignIn",
    description: "✨ Driver sign in with email/password and social login",
    emoji: "🔑",
    category: "Auth",
  },
  {
    id: 4,
    name: "Sign Up Screen",
    route: "SignUp",
    description: "✨ New driver registration with email and password",
    emoji: "📝",
    category: "Auth",
  },

  {
    id: 5,
    name: "Forgot Password",
    route: "ForgotPassword",
    description: "✨ Password reset with SMS or Email option selection",
    emoji: "🔑",
    category: "Auth",
  },
  {
    id: 6,
    name: "OTP Verification",
    route: "OTP",
    description: "✨ One-time password verification with countdown timer",
    emoji: "🔢",
    category: "Auth",
  },
  {
    id: 7,
    name: "Create New Password",
    route: "CreateNewPassword",
    description: "✨ Set new password with confirmation and remember me",
    emoji: "🔒",
    category: "Auth",
  },

  // 🚗 CORE DRIVER SCREENS
  {
    id: 8,
    name: "Main App (Bottom Tabs)",
    route: "MainTabs",
    description:
      "✨ Complete app with bottom navigation: Home, Earnings, Profile",
    emoji: "📱",
    category: "Main",
  },
  {
    id: 9,
    name: "Home Dashboard",
    route: "Home",
    description:
      "✨ Main dashboard with online toggle, stats, and delivery list",
    emoji: "🏠",
    category: "Main",
  },
  {
    id: 10,
    name: "Delivery Details",
    route: "DeliveryDetails",
    description:
      "✨ Full delivery info with customer details, map, and photo upload",
    emoji: "📦",
    category: "Main",
    params: {
      delivery: {
        id: "1",
        customerName: "Sarah Johnson",
        address: "742 Evergreen Terrace, Springfield",
        packageCount: 3,
        status: "pending",
        estimatedTime: "30 min",
        distance: "2.3 km",
        earnings: "$12.50",
        notes: "Leave at door if no answer",
        phone: "+1 555-0123",
      },
    },
  },
  {
    id: 11,
    name: "Earnings Screen",
    route: "Earnings",
    description:
      "✨ Earnings breakdown with today/week/month stats and payout history",
    emoji: "💰",
    category: "Main",
  },
  {
    id: 12,
    name: "Driver Profile",
    route: "Profile",
    description: "✨ Profile with vehicle info, settings menu, and logout",
    emoji: "👤",
    category: "Main",
  },
];

export default function DevScreen({ navigation }) {
  console.log("🛠️ DevScreen rendered");

  const navigateToPage = (page) => {
    console.log("📍 Navigating to:", page.route);
    try {
      if (page.params) {
        navigation.navigate(page.route, page.params);
      } else {
        navigation.navigate(page.route);
      }
    } catch (error) {
      console.log("🔴 Navigation error:", error);
    }
  };

  const categorizedPages = {
    Auth: devPages.filter((p) => p.category === "Auth"),
    Main: devPages.filter((p) => p.category === "Main"),
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>Mallify Delivery</Text>
        <View style={styles.screenCounter}>
          <Text style={styles.counterText}>
            Total Screens: {devPages.length}
          </Text>
        </View>
        <Text style={styles.newScreensNote}></Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {devPages.map((page) => (
          <TouchableOpacity
            key={page.id}
            style={styles.pageCard}
            onPress={() => navigateToPage(page)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <Text style={styles.pageName}>{page.name}</Text>
            </View>
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Created by Mideni</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: StatusBar.currentHeight || 0,
  },
  logoImage: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  brandName: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  screenCounter: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginTop: spacing.md,
    alignSelf: "center",
  },
  counterText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
  newScreensNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  pageCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardContent: {
    flex: 1,
  },
  pageName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  arrow: {
    marginLeft: spacing.md,
  },
  arrowText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: "bold",
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});
