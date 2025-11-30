# Driver Delivery App 🚗📦

A complete React Native **Driver Delivery App** inspired by Amazon Flex. Built with React Navigation, this frontend-only app features a clean, modern UI design system inspired by the pfe mobile e-commerce app.

---

## 📱 Features

### Screens

1. **Login Screen** - Email/password login with quick demo access
2. **Home Dashboard** - Online/offline toggle, delivery stats, and delivery list
3. **Delivery Details** - Full package info, customer details, map placeholder, photo upload
4. **Earnings** - Today/week/month earnings breakdown with stats
5. **Profile** - Driver info, vehicle details, settings, and logout

### Key Functionality

- ✅ Stack + Bottom Tab navigation
- ✅ Status-based delivery tracking (Assigned → In Progress → Delivered)
- ✅ Mock data for deliveries and earnings
- ✅ Photo upload placeholder for proof of delivery
- ✅ Clean, minimal design with consistent spacing and colors
- ✅ Emoji-based icons (no external icon libraries needed)

---

## 🎨 Design System

The app uses a comprehensive design system inspired by the pfe mobile app:

- **Colors**: Primary blue (#2563EB), success green, status-based colors
- **Typography**: Hierarchical text styles (h1-h4, body, caption)
- **Spacing**: Consistent 4px-based spacing scale
- **Components**: Reusable DeliveryCard, Header, PhotoPlaceholder

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- **Expo Go app** on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- OR Expo CLI for simulators/emulators

### Installation

1. **Navigate to the driver app folder:**

   ```bash
   cd "c:\Users\moham\OneDrive\Desktop\big project\driver app"
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start Expo:**

   ```bash
   npm start
   ```

4. **Run on your device:**

   **Option A: Expo Go (Recommended - Easiest)**

   - Install **Expo Go** app on your phone
   - Scan the QR code that appears in terminal
   - App will open in Expo Go!

   **Option B: iOS Simulator (Mac only)**

   - Press `i` in terminal

   **Option C: Android Emulator**

   - Press `a` in terminal

---

## 📂 Project Structure

```
driver app/
├── App.js                          # Main navigation setup
├── index.js                        # App entry point
├── package.json                    # Dependencies
├── src/
│   ├── components/                 # Reusable components
│   │   ├── DeliveryCard.js        # Delivery item card
│   │   ├── Header.js              # Screen header
│   │   └── PhotoPlaceholder.js    # Photo upload placeholder
│   ├── data/
│   │   └── mock.js                # Mock data (deliveries, earnings, driver)
│   ├── screens/                   # All app screens
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── DeliveryDetailsScreen.js
│   │   ├── EarningsScreen.js
│   │   └── ProfileScreen.js
│   └── theme/
│       └── index.js               # Design tokens (colors, typography, spacing)
└── README.md
```

---

## 🎯 Usage

### Quick Demo Login

On the login screen, click **"Quick Demo Login"** to skip authentication and access the app immediately.

### Navigation Flow

1. **Login** → Enter credentials or use quick demo
2. **Home** → View deliveries, toggle online/offline, see stats
3. **Tap a delivery** → View details, start delivery, upload photo, mark complete
4. **Earnings tab** → Check your earnings and stats
5. **Profile tab** → View driver info, settings, logout

---

## 🛠️ Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform (works with Expo Go!)
- **React Navigation** - Navigation library (Stack + Bottom Tabs)
- **JavaScript (JSX)** - No TypeScript
- **StyleSheet API** - Native styling
- **No external UI libraries** - Pure React Native components

---

## 📊 Mock Data

The app includes realistic mock data:

- 4 sample deliveries with different statuses
- Earnings data (today, week, month)
- Driver profile information

All mock data is in `src/data/mock.js` - easily customizable!

---

## 🎨 Customization

### Change Colors

Edit `src/theme/index.js`:

```javascript
export const colors = {
  primary: "#2563EB", // Change to your brand color
  secondary: "#10B981",
  // ... more colors
};
```

### Add More Deliveries

Edit `src/data/mock.js`:

```javascript
export const mockDeliveries = [
  {
    id: "DEL005",
    customerName: "New Customer",
    // ... add more fields
  },
];
```

---

## 🔧 Troubleshooting

### Expo won't start:

```bash
npm start -- --clear
```

### QR code won't scan:

- Make sure phone and computer are on same WiFi network
- Try pressing `w` to open in web browser first
- Or press `a` for Android emulator, `i` for iOS simulator

### App crashes on Expo Go:

```bash
# Clear cache and restart
npm start -- --clear
```

---

## 📝 Notes

- **No backend integration** - All data is mocked
- **No real authentication** - Login is UI-only
- **Photo upload is simulated** - No actual image picker (easily added with `react-native-image-picker`)
- **Map is placeholder** - Can integrate `react-native-maps` for real maps
- **No state management** - Uses local component state (add Redux/Context if needed)

---

## 🚀 Next Steps (Optional Enhancements)

1. Add **real authentication** (Firebase, Auth0)
2. Integrate **react-native-maps** for real map view
3. Add **push notifications** for new deliveries
4. Implement **real photo upload** with `react-native-image-picker`
5. Add **state management** (Redux Toolkit or Context API)
6. Connect to **backend API** for real data
7. Add **offline mode** with AsyncStorage

---

## 📄 License

This is a demo project for educational purposes. Feel free to use and modify as needed.

---

## 🤝 Credits

Design system inspired by the **pfe mobile** e-commerce app. Built with ❤️ using React Native.

---

**Enjoy building! 🚗💨**
