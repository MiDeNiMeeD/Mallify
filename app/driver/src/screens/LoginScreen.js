import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { colors, spacing, fonts } from "../theme";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const handleGoBack = () => {
    navigation.goBack();
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

  const handleSignInWithPassword = () => {
    console.log("Sign in with password");
  };

  const handleSignUp = () => {
    console.log("Sign up");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with back button */}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../assets/login.png")}
            style={styles.loginImage}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Let's get you in</Text>

        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleContinueWithFacebook}
          >
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            <Text style={styles.socialButtonText}>Continue with Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleContinueWithGoogle}
          >
            <Image
              source={require("../../assets/google-logo.png")}
              style={styles.googleLogo}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleContinueWithApple}
          >
            <Ionicons name="logo-apple" size={20} color={colors.black} />
            <Text style={styles.socialButtonText}>Continue with Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Or divider */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.orLine} />
        </View>

        {/* Sign in with password button */}
        <TouchableOpacity
          style={styles.passwordButton}
          onPress={handleSignInWithPassword}
        >
          <Text style={styles.passwordButtonText}>Sign in with password</Text>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
  },
  illustrationContainer: {
    alignItems: "center",
  },
  loginImage: {
    width: 300,
    height: 300,
  },

  title: {
    fontSize: 32,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  socialButtonsContainer: {
    marginBottom: spacing.xs,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: spacing.sm,
    minHeight: 56,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: fonts.poppinsMedium,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    textAlignVertical: "center",
    lineHeight: 20,
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
  passwordButton: {
    backgroundColor: "#016B61",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  passwordButtonText: {
    fontSize: 16,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.white,
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
  signUpText: {
    color: colors.black,
    fontFamily: fonts.poppinsSemiBold,
  },
  googleLogo: {
    width: 27,
    height: 27,
    alignSelf: "center",
  },
});
