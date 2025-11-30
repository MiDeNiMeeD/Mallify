import React, { useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Button from "../components/Button";
import { colors, typography, spacing, borderRadius, fonts } from "../theme";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    title: "Welcome to 👋",
    subtitle: "Mallify Delivery ",
    description:
      "Your flexible way to earn money delivering packages on your schedule!",
    image: require("../../assets/onboardinfscreen1.jpg"),
    backgroundColor: "transparent",
    isFullScreen: true,
  },
  {
    id: 2,
    title: "Work on your own schedule and be your own boss",

    image: require("../../assets/onboardinfscreen2.jpg"),
    backgroundColor: colors.white,
  },
  {
    id: 3,
    title: "Earn more with every delivery you complete",

    image: require("../../assets/onboardinfscreen3.jpg"),
    backgroundColor: colors.white,
  },
  {
    id: 4,
    title: "Let's start delivering and earning money right now!",

    image: require("../../assets/onboardinfscreen4.jpg"),
    backgroundColor: colors.white,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleGetStarted = () => {
    // Navigate to main app - you can replace this with your navigation logic
    if (navigation) {
      navigation.replace("MainTabs");
    }
  };

  const handleSkip = () => {
    // Skip to the last screen or main app
    if (navigation) {
      navigation.replace("MainTabs");
    }
  };

  const currentScreen = onboardingData[currentIndex];
  const isLastScreen = currentIndex === onboardingData.length - 1;
  const isFirstScreen = currentIndex === 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isFirstScreen ? "light-content" : "dark-content"} />

      {/* Main Content */}
      {isFirstScreen ? (
        // Full-screen layout for first screen - Tappable to advance
        <TouchableOpacity
          style={styles.fullScreenContainer}
          onPress={handleNext}
          activeOpacity={1}
        >
          <Image
            source={
              typeof currentScreen.image === "string"
                ? { uri: currentScreen.image }
                : currentScreen.image
            }
            style={styles.fullScreenImage}
            resizeMode="cover"
            fadeDuration={0}
            loadingIndicatorSource={require("../../assets/logo.png")}
          />
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.6)",
              "rgba(0,0,0,0.3)",
              "rgba(0,0,0,0.1)",
              "transparent",
            ]}
            style={styles.fullScreenOverlay}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
          />

          {/* Text Overlay */}
          <View style={styles.fullScreenTextContainer}>
            <Text style={styles.fullScreenTitle}>{currentScreen.title}</Text>
            <Text style={styles.fullScreenSubtitle}>
              {currentScreen.subtitle}
            </Text>
            <Text style={styles.fullScreenDescription}>
              {currentScreen.description}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.content}>
          {/* Image Container */}
          <View style={styles.imageContainer}>
            <Image
              source={
                typeof currentScreen.image === "string"
                  ? { uri: currentScreen.image }
                  : currentScreen.image
              }
              style={styles.backgroundImage}
              resizeMode="cover"
              fadeDuration={0}
              loadingIndicatorSource={require("../../assets/logo.png")}
            />
          </View>

          {/* Text Content */}
          <View
            style={[
              styles.textContainer,
              { backgroundColor: currentScreen.backgroundColor },
            ]}
          >
            <View style={styles.textContent}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {currentScreen.title}
              </Text>
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
              >
                {currentScreen.description}
              </Text>

              {/* Page Indicators */}
              <View style={styles.indicatorContainer}>
                {onboardingData.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      {
                        backgroundColor:
                          index === currentIndex ? "#016B61" : colors.border,
                        width: index === currentIndex ? 20 : 8,
                      },
                    ]}
                  />
                ))}
              </View>

              {/* Action Button */}
              <View style={styles.buttonContainer}>
                {isLastScreen ? (
                  <Button
                    title="Get Started"
                    onPress={handleGetStarted}
                    style={styles.actionButton}
                  />
                ) : (
                  <Button
                    title="Next"
                    onPress={handleNext}
                    style={styles.actionButton}
                    variant="primary"
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    flex: 0.7,
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  textContainer: {
    flex: 0.3,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xl,
  },
  textContent: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.poppinsSemiBold,
    textAlign: "center",
    marginBottom: spacing.sm,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 32,
    fontFamily: fonts.poppinsSemiBold,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 16,
    fontFamily: fonts.poppinsSemiBold,
    textAlign: "center",

    lineHeight: 24,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacing.sm,
  },
  actionButton: {
    width: "100%",
    minHeight: 56,
    backgroundColor: "#016B61",
  },
  // Full-screen styles for first screen
  fullScreenContainer: {
    flex: 1,
    position: "relative",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  fullScreenTextContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingBottom: 70,
    zIndex: 2,
  },
  fullScreenTitle: {
    fontSize: 42,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: "left",
    lineHeight: 50,
  },
  fullScreenSubtitle: {
    fontSize: 60,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.white,
    marginBottom: spacing.lg,
    textAlign: "left",
    lineHeight: 72,
  },
  fullScreenDescription: {
    fontSize: 16,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.white,
    lineHeight: 24,
    textAlign: "left",
    opacity: 0.9,
  },
});
