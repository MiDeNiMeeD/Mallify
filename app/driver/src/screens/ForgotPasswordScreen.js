import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fonts } from "../theme";

export default function ForgotPasswordScreen({ navigation }) {
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleContinue = () => {
    if (selectedMethod === "sms") {
      // Navigate to OTP screen
      navigation.navigate("OTP");
    } else if (selectedMethod === "email") {
      // Navigate to email verification or show success message
      console.log("Email reset link sent");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Select which contact details should we use to reset your password
        </Text>

        {/* SMS Option */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedMethod === "sms" && styles.optionCardSelected,
          ]}
          onPress={() => setSelectedMethod("sms")}
        >
          <View style={styles.optionIcon}>
            <Ionicons
              name="chatbubble-ellipses"
              size={24}
              color={colors.textPrimary}
            />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionLabel}>via SMS:</Text>
            <Text style={styles.optionValue}>+1 111 ******99</Text>
          </View>
        </TouchableOpacity>

        {/* Email Option */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            selectedMethod === "email" && styles.optionCardSelected,
          ]}
          onPress={() => setSelectedMethod("email")}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="mail" size={24} color={colors.textPrimary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionLabel}>via Email:</Text>
            <Text style={styles.optionValue}>and***ley@yourdomain.com</Text>
          </View>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedMethod && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedMethod}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: StatusBar.currentHeight || 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  illustration: {
    width: 180,
    height: 180,
  },
  description: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  optionCardSelected: {
    borderColor: "#016B61",
    backgroundColor: colors.white,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 12,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  optionValue: {
    fontSize: 15,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textPrimary,
  },
  continueButton: {
    backgroundColor: "#016B61",
    paddingVertical: spacing.md + 2,
    borderRadius: 30,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  continueButtonDisabled: {
    backgroundColor: "#016B61",
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.white,
  },
});
