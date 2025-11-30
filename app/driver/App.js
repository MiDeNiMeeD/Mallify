import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, LogBox, View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Font from "expo-font";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

// Enable all console logs
LogBox.ignoreAllLogs(false);

// Global error logging
console.log("🚀 App.js loaded");
if (__DEV__) {
  const originalError = console.error;
  console.error = (...args) => {
    console.log("🔴 CONSOLE ERROR:", ...args);
    originalError(...args);
  };

  const originalWarn = console.warn;
  console.warn = (...args) => {
    console.log("⚠️ CONSOLE WARN:", ...args);
    originalWarn(...args);
  };

  console.log("✅ Error logging enabled");
}

// Screens
import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import DeliveriesScreen from "./src/screens/DeliveriesScreen";
import DeliveryDetailsScreen from "./src/screens/DeliveryDetailsScreen";
import EarningsScreen from "./src/screens/EarningsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import DevScreen from "./src/screens/DevScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import OTPScreen from "./src/screens/OTPScreen";
import CreateNewPasswordScreen from "./src/screens/CreateNewPasswordScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import NotificationScreen from "./src/screens/NotificationScreen";
import DriverServiceScreen from "./src/screens/DriverServiceScreen";
import MapScreen from "./src/screens/MapScreen";
import QRScannerScreen from "./src/screens/QRScannerScreen";

// Theme
import { colors } from "./src/theme";
import { Ionicons } from "@expo/vector-icons";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tabs Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Deliveries") {
            iconName = focused ? "cube" : "cube-outline";
          } else if (route.name === "Earnings") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "home-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#016B61",
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.backgroundSecondary,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Deliveries" component={DeliveriesScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function App() {
  console.log("📱 App component rendering");

  // Load fonts
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  React.useEffect(() => {
    console.log("✅ App mounted successfully");
    if (fontsLoaded) {
      console.log("✅ Fonts loaded successfully");
    }
    return () => console.log("❌ App unmounting");
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading fonts...</Text>
      </View>
    );
  }

  try {
    return (
      <>
        <StatusBar style="auto" />
        <NavigationContainer
          onReady={() => console.log("✅ Navigation ready")}
          onStateChange={(state) =>
            console.log("📍 Nav state:", state?.routes?.[state.index]?.name)
          }
          fallback={<Text>Loading...</Text>}
        >
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: colors.white },
            }}
            initialRouteName="DevScreen"
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="DevScreen" component={DevScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen
              name="CreateNewPassword"
              component={CreateNewPasswordScreen}
            />
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Earnings" component={EarningsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen
              name="DriverService"
              component={DriverServiceScreen}
            />
            <Stack.Screen
              name="QRScanner"
              component={QRScannerScreen}
              options={{
                headerShown: false,
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="Map"
              component={MapScreen}
              options={{
                headerShown: false,
                presentation: "card",
              }}
            />
            <Stack.Screen
              name="DeliveryDetails"
              component={DeliveryDetailsScreen}
              options={{
                headerShown: false,
                presentation: "card",
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </>
    );
  } catch (error) {
    console.log("🔴 Critical error rendering App:", error);
    return (
      <Text style={{ color: "red", padding: 20 }}>Error: {error?.message}</Text>
    );
  }
}
