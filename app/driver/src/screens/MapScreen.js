import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  Linking,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
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

const MapScreen = ({ route, navigation }) => {
  const { deliveries } = route.params;
  const mapRef = useRef(null);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);

  // IMPORTANT: Replace with your actual Google Maps API Key
  // This should match the key in app.json
  // Get your key from: https://console.cloud.google.com/
  // Make sure to enable "Directions API" for this key
  const GOOGLE_MAPS_API_KEY = "AIzaSyAByMOGtSYtVBYWkzqjl9494eAdbcqylzQ";

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError(true);
        console.log("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLocationError(false);
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError(true);
      // Try with last known position as fallback
      try {
        const lastLocation = await Location.getLastKnownPositionAsync();
        if (lastLocation) {
          setUserLocation({
            latitude: lastLocation.coords.latitude,
            longitude: lastLocation.coords.longitude,
          });
          setLocationError(false);
        }
      } catch (fallbackError) {
        console.error("Fallback location also failed:", fallbackError);
      }
    }
  };

  const centerOnMyLocation = async () => {
    if (userLocation) {
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000
      );
    } else {
      Alert.alert(
        "Location Unavailable",
        "Unable to get your current location. Please make sure location services are enabled.",
        [
          { text: "Try Again", onPress: () => getCurrentLocation() },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const openDirections = (delivery) => {
    const destination = `${delivery.destination.latitude},${delivery.destination.longitude}`;
    const origin = userLocation
      ? `${userLocation.latitude},${userLocation.longitude}`
      : "";

    let url;
    if (Platform.OS === "ios") {
      url = `http://maps.apple.com/?daddr=${destination}${
        origin ? `&saddr=${origin}` : ""
      }`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${destination}${
        origin ? `&origin=${origin}` : ""
      }`;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Error", "Unable to open maps application");
        }
      })
      .catch((err) => {
        console.error("Error opening maps:", err);
        Alert.alert("Error", "Failed to open directions");
      });
  };

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
        return "#FF9800"; // Orange
      case "picked_up":
      case "in-progress":
        return "#70B2B2"; // Teal
      case "delivered":
        return "#4CAF50"; // Green
      default:
        return "#FF9800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "picked_up":
        return "Picked Up";
      case "in-progress":
        return "In Progress";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  const focusOnMarker = (delivery) => {
    setSelectedDelivery(delivery);
    mapRef.current?.animateToRegion({
      latitude: delivery.destination.latitude,
      longitude: delivery.destination.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Map</Text>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsTraffic={false}
      >
        {deliveries.map((delivery) => (
          <Marker
            key={delivery.id}
            coordinate={{
              latitude: delivery.destination.latitude,
              longitude: delivery.destination.longitude,
            }}
            onPress={() => focusOnMarker(delivery)}
            pinColor={getMarkerColor(delivery.status)}
          >
            <View style={styles.customMarker}>
              <View
                style={[
                  styles.markerInner,
                  { backgroundColor: getMarkerColor(delivery.status) },
                ]}
              >
                <Ionicons name="location" size={20} color="#fff" />
              </View>
            </View>
          </Marker>
        ))}

        {/* Directions Route */}
        {showDirections && selectedDelivery && userLocation && (
          <MapViewDirections
            origin={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            destination={{
              latitude: selectedDelivery.destination.latitude,
              longitude: selectedDelivery.destination.longitude,
            }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#70B2B2"
            optimizeWaypoints={true}
            onReady={(result) => {
              setRouteDistance(result.distance.toFixed(1));
              setRouteDuration(Math.ceil(result.duration));
            }}
            onError={(errorMessage) => {
              console.error("Directions Error:", errorMessage);
              Alert.alert(
                "Route Error",
                "Unable to calculate route. Please check your API key or try again."
              );
              setShowDirections(false);
            }}
          />
        )}
      </MapView>

      {/* Route Info Banner */}
      {showDirections && routeDistance && (
        <View style={styles.routeInfoBanner}>
          <View style={styles.routeInfoItem}>
            <Ionicons name="navigate-circle" size={20} color="#70B2B2" />
            <Text style={styles.routeInfoText}>
              {routeDistance} km · {routeDuration} min
            </Text>
          </View>
          <TouchableOpacity
            onPress={closeDirections}
            style={styles.closeRouteButton}
          >
            <Text style={styles.closeRouteText}>Clear Route</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selected Delivery Info Card */}
      {selectedDelivery && (
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoLeft}>
              <Text style={styles.deliveryId}>{selectedDelivery.id}</Text>
              <Text style={styles.customerName}>
                {selectedDelivery.customerName}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getMarkerColor(selectedDelivery.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(selectedDelivery.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={styles.infoAddress} numberOfLines={2}>
              {selectedDelivery.address}
            </Text>
          </View>

          {selectedDelivery.notes && (
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.infoNotes} numberOfLines={2}>
                {selectedDelivery.notes}
              </Text>
            </View>
          )}

          <View style={styles.infoFooter}>
            <View style={styles.infoItem}>
              <Ionicons
                name="cube-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.infoItemText}>
                {selectedDelivery.packageCount}{" "}
                {selectedDelivery.packageCount === 1 ? "Package" : "Packages"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.infoItemText}>
                {selectedDelivery.estimatedTime}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.directionsButton]}
              onPress={() => openDirections(selectedDelivery)}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.detailsButton]}
              onPress={() => {
                navigation.navigate("DeliveryDetails", {
                  delivery: selectedDelivery,
                });
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="information-circle" size={18} color="#70B2B2" />
              <Text style={[styles.actionButtonText, styles.detailsButtonText]}>
                More Details
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeInfoButton}
            onPress={() => setSelectedDelivery(null)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#FF9800" }]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#70B2B2" }]} />
          <Text style={styles.legendText}>In Progress</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#4CAF50" }]} />
          <Text style={styles.legendText}>Delivered</Text>
        </View>
      </View>

      {/* My Location Button */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={centerOnMyLocation}
        activeOpacity={0.8}
      >
        <Ionicons name="locate" size={24} color="#70B2B2" />
      </TouchableOpacity>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundSecondary,
    ...shadows.small,
    marginTop: StatusBar.currentHeight || 0,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.h3,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  deliveryCount: {
    fontSize: 10,
    fontFamily: fonts.poppinsMedium,
    color: "#70B2B2",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    ...shadows.medium,
  },
  infoCard: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.large,
    padding: spacing.lg,
    ...shadows.large,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  infoLeft: {
    flex: 1,
  },
  deliveryId: {
    fontSize: 12,
    fontFamily: fonts.poppinsMedium,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  customerName: {
    fontSize: 16,
    fontFamily: fonts.poppinsBold,
    color: colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.small,
  },
  statusText: {
    fontSize: 11,
    fontFamily: fonts.poppinsSemiBold,
    color: "#fff",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  infoAddress: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoNotes: {
    flex: 1,
    fontSize: 12,
    fontFamily: fonts.poppinsRegular,
    color: colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 16,
  },
  infoFooter: {
    flexDirection: "row",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.backgroundSecondary,
    gap: spacing.lg,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  infoItemText: {
    fontSize: 12,
    fontFamily: fonts.poppinsMedium,
    color: colors.textPrimary,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.medium,
    gap: spacing.xs,
  },
  directionsButton: {
    backgroundColor: "#70B2B2",
  },
  detailsButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#70B2B2",
  },
  actionButtonText: {
    fontSize: 13,
    fontFamily: fonts.poppinsSemiBold,
    color: "#fff",
  },
  detailsButtonText: {
    color: "#70B2B2",
  },
  closeInfoButton: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  routeInfoBanner: {
    position: "absolute",
    top: spacing.xl + 60 + (StatusBar.currentHeight || 0),
    left: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.medium,
    maxWidth: width - spacing.xl * 2,
  },
  routeInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  routeInfoText: {
    fontSize: 13,
    fontFamily: fonts.poppinsSemiBold,
    color: colors.textPrimary,
  },
  closeRouteButton: {
    marginLeft: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  closeRouteText: {
    fontSize: 12,
    fontFamily: fonts.poppinsMedium,
    color: "#70B2B2",
  },
  legend: {
    position: "absolute",
    top: spacing.xl + 60 + StatusBar.currentHeight,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.medium,
    padding: spacing.sm,
    ...shadows.medium,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  legendText: {
    fontSize: 11,
    fontFamily: fonts.poppinsRegular,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  myLocationButton: {
    position: "absolute",
    top: spacing.xl + 60 + StatusBar.currentHeight,
    left: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.large,
  },
});

export default MapScreen;
