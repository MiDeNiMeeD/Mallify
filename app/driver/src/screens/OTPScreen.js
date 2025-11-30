import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { colors, spacing, fonts } from "../theme";

const { width, height } = Dimensions.get("window");

export default function OTPScreen({ navigation }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [countdown, setCountdown] = useState(55);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const intervalRef = useRef(null);

  // Start countdown timer
  useEffect(() => {
    startCountdown();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startCountdown = () => {
    setCountdown(55);
    setCanResend(false);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleOtpChange = (value, index) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if value entered
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
        setActiveIndex(index + 1);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join("");
    console.log("Verify OTP:", otpCode);
  };

  const handleResendCode = () => {
    if (canResend) {
      console.log("Resend code");
      // Reset OTP
      setOtp(["", "", "", ""]);
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
      // Restart countdown
      startCountdown();
    }
  };

  const handleNumberPadPress = (number) => {
    if (activeIndex < 4) {
      handleOtpChange(number, activeIndex);
    }
  };

  const handleDeletePress = () => {
    if (activeIndex >= 0) {
      const newOtp = [...otp];
      if (otp[activeIndex]) {
        // Clear current input
        newOtp[activeIndex] = "";
        setOtp(newOtp);
      } else if (activeIndex > 0) {
        // Move to previous input and clear it
        const prevIndex = activeIndex - 1;
        newOtp[prevIndex] = "";
        setOtp(newOtp);
        setActiveIndex(prevIndex);
        inputRefs.current[prevIndex]?.focus();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Verify your email</Text>

        {/* Description */}
        <Text style={styles.description}>
          Code has been sent to +1 111 ****567
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                activeIndex === index && styles.otpInputActive,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setActiveIndex(index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Code */}
        <TouchableOpacity
          onPress={handleResendCode}
          style={[styles.resendContainer, !canResend && styles.resendDisabled]}
          disabled={!canResend}
        >
          {canResend ? (
            <Text style={styles.resendText}>
              <Text style={styles.resendActive}>Resend code</Text>
            </Text>
          ) : (
            <Text style={styles.resendText}>
              Resend code in{" "}
              <Text style={styles.resendTimer}>{countdown} s</Text>
            </Text>
          )}
        </TouchableOpacity>

        {/* Verify Button */}
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyButtonText}>Verify</Text>
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
    marginTop: spacing.xxl,
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
    justifyContent: "flex-start",
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    textAlign: "left",
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: 16,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    textAlign: "left",
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 24,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  otpInputActive: {
    borderColor: "#016B61",
    borderWidth: 2,
  },
  otpInputFilled: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.textPrimary,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  resendText: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
  },
  resendTimer: {
    color: "#016B61",
    fontFamily: fonts.poppinsSemiBold,
  },
  resendDisabled: {
    opacity: 0.6,
  },
  resendActive: {
    color: "#016B61",
    fontFamily: fonts.poppinsSemiBold,
    textDecorationLine: "underline",
  },
  verifyButton: {
    backgroundColor: "#016B61",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.white,
  },
  numberPad: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: spacing.xxl,
  },
  numberRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.lg,
  },
  numberButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    fontSize: 24,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textPrimary,
  },
  deleteButton: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
});
