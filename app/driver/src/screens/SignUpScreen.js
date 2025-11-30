import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { colors, spacing, fonts } from "../theme";

const { width, height } = Dimensions.get("window");

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setrePassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSignUp = () => {
    console.log("Sign up", { email, password, rememberMe });
  };

  const handleContinueWithFacebook = () => {
    console.log("Continue with Facebook");
  };

  const handleContinueWithGoogle = () => {
    console.log("Continue with Google");
  };

  const handleContinueWithApple = () => {
    console.log("Continue with Apple");
  };

  const handleSignIn = () => {
    console.log("Navigate to Sign In");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with back button */}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Create</Text>
          <Text style={styles.title}>your Account</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {/* repeat Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Repeat Password"
              placeholderTextColor={colors.textSecondary}
              value={repassword}
              onChangeText={setrePassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Remember Me */}
          <View style={styles.rememberContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={toggleRememberMe}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                )}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>

        {/* Or divider */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or continue with</Text>
          <View style={styles.orLine} />
        </View>

        {/* Social Login Icons */}
        <View style={styles.socialIconsContainer}>
          <TouchableOpacity
            style={styles.socialIcon}
            onPress={handleContinueWithFacebook}
          >
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialIcon}
            onPress={handleContinueWithGoogle}
          >
            <Image
              source={require("../../assets/google-logo.png")}
              style={styles.googleLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialIcon}
            onPress={handleContinueWithApple}
          >
            <Ionicons name="logo-apple" size={24} color={colors.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text style={styles.signInText} onPress={handleSignIn}>
            Sign in
          </Text>
        </Text>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
  },
  titleContainer: {
    marginBottom: spacing.xxl,
    marginTop: spacing.xxl,
  },
  title: {
    fontSize: 40,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    textAlign: "left",
    lineHeight: 50,
    letterSpacing: 0.5,
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  rememberContainer: {
    marginBottom: spacing.xl,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
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
  signUpButton: {
    backgroundColor: "#016B61",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  signUpButtonText: {
    fontSize: 16,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.white,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  orText: {
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    textAlign: "center",
    marginHorizontal: spacing.md,
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  socialIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
  },
  signInText: {
    color: colors.black,
    fontFamily: fonts.poppinsSemiBold,
  },
  googleLogo: {
    width: 28,
    height: 28,
  },
});
