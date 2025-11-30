// Theme system inspired by pfe mobile design
export const colors = {
  primary: "#FF6B6B",
  primaryDark: "#E55555",
  secondary: "#4ECDC4",
  accent: "#45B7D1",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",
  gray: "#8E8E93",
  lightGray: "#F2F2F7",
  darkGray: "#3A3A3C",

  // Text
  textPrimary: "#1C1C1E",
  textSecondary: "#8E8E93",
  textLight: "#FFFFFF",

  // Background
  background: "#FFFFFF",
  backgroundSecondary: "#F2F2F7",

  // Status
  success: "#34C759",
  warning: "#FF9500",
  error: "#FF3B30",

  // Overlay
  overlay: "rgba(0, 0, 0, 0.5)",

  // Borders
  border: "#E5E5EA",

  // Delivery status (for driver app compatibility)
  statusAssigned: "#3B82F6",
  statusInProgress: "#F59E0B",
  statusDelivered: "#10B981",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fonts = {
  poppinsRegular: "Poppins_400Regular",
  poppinsMedium: "Poppins_500Medium",
  poppinsSemiBold: "Poppins_600SemiBold",
  poppinsBold: "Poppins_700Bold",
  montserratRegular: "Montserrat_400Regular",
  montserratMedium: "Montserrat_500Medium",
  montserratSemiBold: "Montserrat_600SemiBold",
  montserratBold: "Montserrat_700Bold",
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 40,
    fontFamily: fonts.poppinsBold,
  },
  h2: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
    fontFamily: fonts.poppinsBold,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
    fontFamily: fonts.poppinsSemiBold,
  },
  body: {
    fontSize: 16,
    fontWeight: "normal",
    lineHeight: 24,
    fontFamily: fonts.poppinsRegular,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "normal",
    lineHeight: 20,
    fontFamily: fonts.poppinsRegular,
  },
  caption: {
    fontSize: 12,
    fontWeight: "normal",
    lineHeight: 16,
    fontFamily: fonts.poppinsRegular,
  },
};

export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  extraLarge: 24,
  round: 50,
};

export const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 8,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12.54,
    elevation: 16,
  },
};
