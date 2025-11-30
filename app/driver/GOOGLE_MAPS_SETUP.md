# Google Maps Setup Guide

## Overview

The Driver Delivery App now includes a MapScreen that displays all delivery orders with colored pins on Google Maps.

## Features

- 📍 All delivery orders shown as pins on the map
- 🎨 Color-coded pins based on delivery status:
  - **Orange**: Pending orders
  - **Teal (#70B2B2)**: In Progress / Picked Up orders
  - **Green**: Delivered orders
- 🗺️ Auto-zoom to show all delivery locations
- 📝 Tap on a pin to see delivery details
- 📱 Shows user's current location
- 🧭 Built-in compass and location controls

## Setup Instructions

### 1. Get Google Maps API Keys

#### For Android:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Maps SDK for Android"
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Restrict the key to Android apps
6. Add your package name: `com.driver.deliveryapp`

#### For iOS:

1. In the same Google Cloud Console project
2. Enable "Maps SDK for iOS"
3. Create another API Key (or use the same one)
4. Restrict the key to iOS apps
5. Add your bundle identifier: `com.driver.deliveryapp`

### 2. Add API Keys to app.json

Replace the placeholder values in `app.json`:

```json
"ios": {
  "config": {
    "googleMapsApiKey": "YOUR_ACTUAL_IOS_API_KEY_HERE"
  }
},
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_ACTUAL_ANDROID_API_KEY_HERE"
    }
  }
}
```

### 3. Rebuild Your App

After adding the API keys, you need to rebuild:

```bash
# For development
npx expo start --clear

# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

### 4. Testing on Emulator/Simulator

#### Android Emulator:

- Make sure Google Play Services is installed
- Enable location services in emulator settings

#### iOS Simulator:

- Go to Features → Location → Custom Location
- Enter coordinates to test location features

## Usage

1. Open the app and navigate to the Home screen
2. Click the "View All on Map" button
3. The map will open showing all delivery orders with pins
4. Tap any pin to see order details in a popup card
5. Use the legend in the top-right to understand pin colors
6. Use pinch-to-zoom and drag gestures to navigate the map

## Mock Data

The app currently uses mock delivery data with these locations:

- DEL001: Downtown LA (34.0522, -118.2437)
- DEL002: Westside LA (34.0622, -118.2537)
- DEL003: Eastside LA (34.0422, -118.2337)
- DEL004: Northside LA (34.0722, -118.2637)

You can modify the locations in `src/data/mock.js` to test different scenarios.

## Troubleshooting

### Map not showing:

- Verify API keys are correctly added to `app.json`
- Check that Maps SDK is enabled in Google Cloud Console
- Rebuild the app after adding keys
- Check console for error messages

### Pins not appearing:

- Verify delivery data has `destination.latitude` and `destination.longitude`
- Check that coordinates are valid numbers

### Location not working:

- Enable location permissions on device/emulator
- For iOS: Add location permission to Info.plist (Expo handles this automatically)
- For Android: Location permissions are included in the app

## Next Steps

To connect to real data:

1. Replace mock data in `src/data/mock.js` with API calls
2. Update the `deliveries` state in `HomeScreen.js` to fetch from your backend
3. Add real-time location tracking for the driver
4. Implement route optimization between delivery points

## Support

For Google Maps API issues, refer to:

- [Expo Maps Documentation](https://docs.expo.dev/versions/latest/sdk/map-view/)
- [React Native Maps GitHub](https://github.com/react-native-maps/react-native-maps)
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
