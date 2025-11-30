import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from "react-native";
import { colors } from "../theme";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ onLoadingComplete, navigation }) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the dots circle spin animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    // Complete loading after 3 seconds
    const timer = setTimeout(() => {
      spinAnimation.stop();
      if (navigation) {
        navigation.replace("Onboarding");
      } else {
        onLoadingComplete();
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      spinAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <View style={styles.logoWrapper}>
          {/* Logo Image */}
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Spinning Dots Circle */}
      <View style={styles.loadingContainer}>
        <Animated.View
          style={[
            styles.dotsCircle,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <View style={[styles.circleDot, styles.dot1]} />
          <View style={[styles.circleDot, styles.dot2]} />
          <View style={[styles.circleDot, styles.dot3]} />
          <View style={[styles.circleDot, styles.dot4]} />
          <View style={[styles.circleDot, styles.dot5]} />
          <View style={[styles.circleDot, styles.dot6]} />
          <View style={[styles.circleDot, styles.dot7]} />
          <View style={[styles.circleDot, styles.dot8]} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 80,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 200,
    height: 200,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  dotsCircle: {
    width: 60,
    height: 60,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  circleDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2D2D2D",
  },
  dot1: {
    top: 0,
    left: "50%",
    marginLeft: -3,
    opacity: 1,
  },
  dot2: {
    top: 6,
    right: 6,
    opacity: 0.9,
  },
  dot3: {
    top: "50%",
    right: 0,
    marginTop: -3,
    opacity: 0.8,
  },
  dot4: {
    bottom: 6,
    right: 6,
    opacity: 0.7,
  },
  dot5: {
    bottom: 0,
    left: "50%",
    marginLeft: -3,
    opacity: 0.6,
  },
  dot6: {
    bottom: 6,
    left: 6,
    opacity: 0.5,
  },
  dot7: {
    top: "50%",
    left: 0,
    marginTop: -3,
    opacity: 0.4,
  },
  dot8: {
    top: 6,
    left: 6,
    opacity: 0.3,
  },
});
