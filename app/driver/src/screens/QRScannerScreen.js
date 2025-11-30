import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  fonts,
} from "../theme";

const { width, height } = Dimensions.get("window");

const QRScannerScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const scanAnimation = new Animated.Value(0);

  useEffect(() => {
    startScanAnimation();
  }, []);

  useEffect(() => {
    if (permission === null) {
      requestPermission();
    }
  }, [permission]);

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert("QR Code Scanned!", `Type: ${type}\nData: ${data}`, [
      {
        text: "Scan Again",
        onPress: () => setScanned(false),
      },
      {
        text: "OK",
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const scanLineTranslateY = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250],
  });

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.messageText}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QR Scanner</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="camera-off" size={64} color={colors.textSecondary} />
          <Text style={styles.messageText}>No access to camera</Text>
          <Text style={styles.subMessageText}>
            Please enable camera permission in settings
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Header */}
      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity
            style={styles.flashButton}
            onPress={() => setFlashOn(!flashOn)}
          >
            <Ionicons
              name={flashOn ? "flash" : "flash-off"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Scan Area */}
        <View style={styles.scanAreaContainer}>
          <Text style={styles.instructionText}>
            Position QR code within the frame
          </Text>

          <View style={styles.scanArea}>
            {/* Corner Brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Animated Scan Line */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineTranslateY }] },
                ]}
              />
            )}
          </View>

          <Text style={styles.tipText}>
            {scanned ? "Processing..." : "Align QR code to scan"}
          </Text>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomContainer}>
          {scanned && (
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => setScanned(false)}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.rescanText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    marginTop: StatusBar.currentHeight || 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.poppinsBold,
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  flashButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  messageText: {
    fontSize: 16,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textPrimary,
    textAlign: "center",
    marginTop: spacing.md,
  },
  subMessageText: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: fonts.poppinsMedium,
    color: "#fff",
    textAlign: "center",
    marginBottom: spacing.xl,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  scanArea: {
    width: 250,
    height: 250,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#70B2B2",
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: borderRadius.medium,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: borderRadius.medium,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: borderRadius.medium,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: borderRadius.medium,
  },
  scanLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#70B2B2",
    shadowColor: "#70B2B2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  tipText: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: "#fff",
    textAlign: "center",
    marginTop: spacing.xl,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
  },
  bottomContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: "center",
  },
  rescanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#70B2B2",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.medium,
    gap: spacing.sm,
    ...shadows.large,
  },
  rescanText: {
    fontSize: 16,
    fontFamily: fonts.poppinsBold,
    color: "#fff",
  },
});

export default QRScannerScreen;
