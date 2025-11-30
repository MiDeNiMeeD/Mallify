import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Image,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import DeliveryCard from "../components/DeliveryCard";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  fonts,
} from "../theme";
import { mockDeliveries } from "../data/mock";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  console.log("🏠 HomeScreen rendered");

  const [isOnline, setIsOnline] = useState(true);
  const [deliveries] = useState(mockDeliveries);
  const [selectedFilter, setSelectedFilter] = useState("All");

  console.log("📦 Total deliveries:", deliveries.length);
  const activeDeliveries = deliveries.filter((d) => d.status !== "delivered");
  console.log("📦 Active deliveries:", activeDeliveries.length);

  const filterOptions = ["All", "Pending", "Picked Up", "Delivered"];

  const filteredDeliveries =
    selectedFilter === "All"
      ? deliveries
      : deliveries.filter((d) => {
          if (selectedFilter === "Pending") return d.status === "pending";
          if (selectedFilter === "Picked Up") return d.status === "picked_up";
          if (selectedFilter === "Delivered") return d.status === "delivered";
          return true;
        });

  // Stats summary
  const stats = [
    {
      label: "Today's Earnings",
      value: "$127.50",
      icon: "cash-outline",
      color: "#4CAF50",
      lightColor: "#E8F5E9",
      trend: "+15%",
      trendUp: true,
    },
    {
      label: "Active Deliveries",
      value: activeDeliveries.length,
      icon: "bicycle-outline",
      color: "#FF9800",
      lightColor: "#FFF4E5",
      trend: "+3",
      trendUp: true,
    },
    {
      label: "Completed Today",
      value: deliveries.filter((d) => d.status === "delivered").length,
      icon: "checkmark-done-circle-outline",
      color: "#70B2B2",
      lightColor: "#E5F5F4",
      trend: "+8",
      trendUp: true,
    },
    {
      label: "Total Distance",
      value: "24.5 km",
      icon: "speedometer-outline",
      color: "#2196F3",
      lightColor: "#E3F2FD",
      trend: "+5.2 km",
      trendUp: true,
    },
    {
      label: "Avg. Rating",
      value: "4.8",
      icon: "star-outline",
      color: "#FFC107",
      lightColor: "#FFF9E6",
      trend: "+0.2",
      trendUp: true,
    },
    {
      label: "Online Hours",
      value: "6.5 hrs",
      icon: "time-outline",
      color: "#9C27B0",
      lightColor: "#F3E5F5",
      trend: "+1.5 hrs",
      trendUp: true,
    },
  ];

  // Calculate initial region to show all markers
  const getInitialRegion = () => {
    if (!deliveries || deliveries.length === 0) {
      return {
        latitude: 34.0522,
        longitude: -118.2437,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    const latitudes = deliveries.map((d) => d.destination.latitude);
    const longitudes = deliveries.map((d) => d.destination.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.5;
    const deltaLng = (maxLng - minLng) * 1.5;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(deltaLat, 0.05),
      longitudeDelta: Math.max(deltaLng, 0.05),
    };
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case "pending":
        return "#FF9800";
      case "picked_up":
      case "in-progress":
        return "#70B2B2";
      case "delivered":
        return "#4CAF50";
      default:
        return "#FF9800";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Profile */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: "https://scontent.ftun1-2.fna.fbcdn.net/v/t39.30808-1/470468285_1609345313014084_246144399086604_n.jpg?stp=dst-jpg_p160x160_tt6&_nc_cat=105&ccb=1-7&_nc_sid=28885b&_nc_ohc=P-s65qfjS1YQ7kNvwHKDQb0&_nc_oc=Adnq0XHSqeAshpFqr54mCSPmtzkM7BbTMVQ2NMcKaDnq8OYk1Q7J-YbBTG3NvLJvCCg&_nc_zt=24&_nc_ht=scontent.ftun1-2.fna&_nc_gid=m9Nddi9IRfH5Z-ZpiNRyOw&oh=00_Afd7jQCRntbaJPhFwaAlUu8vg9UuLNbM4DyKNI2C_t1jPw&oe=68F06310",
            }}
            style={styles.profileImage}
          />
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Good Morning 👋</Text>
            <Text style={styles.userName}>David Driver</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("QRScanner")}
          >
            <Ionicons
              name="qr-code-outline"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Notification")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContent}
        >
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.statCard, { backgroundColor: stat.lightColor }]}
              activeOpacity={0.85}
            >
              <View style={styles.statCardHeader}>
                <View
                  style={[
                    styles.statIconCircle,
                    { backgroundColor: stat.color },
                  ]}
                >
                  <Ionicons name={stat.icon} size={20} color="#FFFFFF" />
                </View>
                <View
                  style={[
                    styles.trendBadge,
                    {
                      backgroundColor: stat.trendUp ? "#E8F5E9" : "#FFEBEE",
                    },
                  ]}
                >
                  <Ionicons
                    name={stat.trendUp ? "trending-up" : "trending-down"}
                    size={10}
                    color={stat.trendUp ? "#4CAF50" : "#F44336"}
                  />
                  <Text
                    style={[
                      styles.trendText,
                      {
                        color: stat.trendUp ? "#4CAF50" : "#F44336",
                      },
                    ]}
                  >
                    {stat.trend}
                  </Text>
                </View>
              </View>

              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>

              <View style={styles.statFooter}>
                <View
                  style={[styles.statDot, { backgroundColor: stat.color }]}
                />
                <Text style={styles.statSubtext}>Today</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Preview */}
      <TouchableOpacity
        style={styles.mapPreviewContainer}
        activeOpacity={0.9}
        onPress={() => navigation.navigate("Map", { deliveries })}
      >
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.mapPreview}
          initialRegion={getInitialRegion()}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsTraffic={false}
          toolbarEnabled={false}
        >
          {deliveries.map((delivery) => (
            <Marker
              key={delivery.id}
              coordinate={{
                latitude: delivery.destination.latitude,
                longitude: delivery.destination.longitude,
              }}
              pinColor={getMarkerColor(delivery.status)}
            />
          ))}
        </MapView>
        <View style={styles.mapOverlay}>
          <View style={styles.mapOverlayContent}>
            <Ionicons name="map" size={24} color="#fff" />
            <Text style={styles.mapOverlayText}>View All on Map</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </View>
          <Text style={styles.mapOverlaySubtext}>
            {deliveries.length}{" "}
            {deliveries.length === 1 ? "delivery" : "deliveries"} to show
          </Text>
        </View>
      </TouchableOpacity>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter && styles.filterTabTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Deliveries List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons
              name="list"
              size={20}
              color="#70B2B2"
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>
              {selectedFilter === "All" ? "All Deliveries" : selectedFilter}
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.deliveryCount}>
              {filteredDeliveries.length}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.deliveriesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.deliveriesContent}
        >
          {filteredDeliveries.length > 0 ? (
            filteredDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                onPress={() => {
                  console.log("📦 Delivery card pressed:", delivery.id);
                  navigation.navigate("DeliveryDetails", { delivery });
                }}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="cube-outline" size={48} color="#9ECFD4" />
              </View>
              <Text style={styles.emptyText}>
                No {selectedFilter.toLowerCase()} deliveries
              </Text>
              <Text style={styles.emptySubtext}>
                {selectedFilter === "All"
                  ? "Turn online to receive deliveries"
                  : `You don't have any ${selectedFilter.toLowerCase()} orders`}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    marginTop: StatusBar.currentHeight || 0,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subGreeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  statusTextOnline: {
    color: colors.success,
  },
  statsContainer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  statsScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  statCard: {
    width: 130,
    borderRadius: 16,
    padding: 12,
    ...shadows.small,
    minHeight: 115,
    justifyContent: "space-between",
    marginVertical: spacing.sm,
  },
  statCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.small,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  trendText: {
    fontSize: 9,
    fontFamily: fonts.poppinsBold,
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.poppinsBold,
    lineHeight: 28,
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: fonts.poppinsMedium,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  statFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statSubtext: {
    fontSize: 11,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
  },
  filterContainer: {
    // hnee
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.white,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.xs,
  },
  filterTabActive: {
    backgroundColor: "#70B2B2",
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: fonts.poppinsMedium,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
    paddingBottom: spacing.sm,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sectionIcon: {
    marginRight: spacing.md,
  },
  countBadge: {
    backgroundColor: "#70B2B2",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.medium,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryCount: {
    fontSize: 13,
    fontFamily: fonts.poppinsBold,
    color: "#fff",
  },
  mapPreviewContainer: {
    marginHorizontal: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.large,
    overflow: "hidden",
    height: 180,
    ...shadows.small,
  },
  mapPreview: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(112, 178, 178, 0.95)",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  mapOverlayContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  mapOverlayText: {
    fontSize: 16,
    fontFamily: fonts.poppinsBold,
    color: "#fff",
  },
  mapOverlaySubtext: {
    fontSize: 12,
    fontFamily: fonts.poppinsRegular,
    color: "#fff",
    textAlign: "center",
    marginTop: 4,
    opacity: 0.9,
  },
  section: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
  },
  deliveriesList: {
    flex: 1,
  },
  deliveriesContent: {
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F0F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default HomeScreen;
