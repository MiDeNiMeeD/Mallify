import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fonts } from "../theme";

export default function CreateNewPasswordScreen({ navigation }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleContinue = () => {
    if (newPassword && confirmPassword && newPassword === confirmPassword) {
      // Navigate to success screen or login
      navigation.navigate("Login");
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
        <Text style={styles.headerTitle}>Create New Password</Text>
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

        {/* Title */}
        <Text style={styles.title}>Create Your New Password</Text>

        {/* New Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIconContainer}>
            <Ionicons name="lock-closed" size={20} color={colors.textPrimary} />
          </View>
          <TextInput
            style={styles.textInput}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••••••"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!showNewPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Ionicons
              name={showNewPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIconContainer}>
            <Ionicons name="lock-closed" size={20} color={colors.textPrimary} />
          </View>
          <TextInput
            style={styles.textInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••••••"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Remember Me Checkbox */}
        <TouchableOpacity
          style={styles.rememberContainer}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            )}
          </View>
          <Text style={styles.rememberText}>Remember me</Text>
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!newPassword || !confirmPassword) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!newPassword || !confirmPassword}
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
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  illustration: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: "left",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    height: 56,
  },
  inputIconContainer: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: "#016B61",
    borderColor: "#016B61",
  },
  rememberText: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
  },
  continueButton: {
    backgroundColor: "#016B61",
    paddingVertical: spacing.md + 2,
    borderRadius: 30,
    alignItems: "center",
    marginTop: spacing.md,
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
