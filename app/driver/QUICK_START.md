# 🚀 Quick Start Guide - Driver Delivery App

## ⚡ Get Running in 3 Steps

### 1️⃣ Install Dependencies (2 minutes)

```powershell
cd "c:\Users\moham\OneDrive\Desktop\big project\driver app"
npm install
```

### 2️⃣ Start Expo (30 seconds)

```powershell
npm start
```

### 3️⃣ Open in Expo Go

**Option A: On Your Phone (Easiest!)**

1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Scan the QR code in your terminal
3. App opens instantly! 🎉

**Option B: Simulator/Emulator**

- Press `i` for iOS Simulator (Mac only)
- Press `a` for Android Emulator
- Press `w` for Web Browser
- Click **"Quick Demo Login"** button
- You're in! 🎉

---

## 📱 What You'll See

### Login Screen

- Logo with car icon 🚗
- Email/password fields
- **Quick Demo Login** button (click this!)

### Home Screen (Main Tab)

- Online/Offline toggle (tap to switch status)
- Stats: 3 active, 1 completed, $127.50 today
- **4 delivery cards** (tap any to see details)

### Delivery Details

1. Tap any delivery card from Home
2. See customer info, address, notes
3. Click **"🚗 Start Delivery"** → Status changes to "In Progress"
4. Click **"📷 Tap to upload photo"** → Photo uploaded
5. Click **"✓ Mark as Delivered"** → Delivery complete!

### Earnings Screen (Tab 2)

- Big blue card: **$127.50 today**
- Weekly: $645.75
- Monthly: $2,580
- Stats cards with calculations

### Profile Screen (Tab 3)

- Driver info: David Martinez
- Vehicle: Toyota Camry
- Rating: ⭐ 4.8
- **Logout button** at bottom

---

## 🎮 Interactive Features

### Try These Actions:

1. **Toggle Online/Offline** (Home screen)

   - Tap the switch in the header
   - Green = Online, Gray = Offline

2. **Complete a Delivery**

   - Home → Tap "DEL001"
   - Start Delivery
   - Upload Photo
   - Mark as Delivered
   - See success message!

3. **Report an Issue**

   - Open any delivery
   - Tap "⚠️ Report Issue"
   - See issue options popup

4. **View Map**

   - Delivery Details → See map placeholder with coordinates

5. **Check Earnings**

   - Tap Earnings tab
   - See calculated stats (avg per delivery, per hour, etc.)

6. **Logout**
   - Profile tab → Scroll to bottom
   - Tap "🚪 Logout"
   - Confirm → Back to login

---

## 🗂️ Mock Data Locations

Want to change the data? Edit `src/data/mock.js`:

```javascript
// Add a new delivery
{
  id: 'DEL005',
  customerName: 'Your Name',
  address: 'Your Address',
  status: 'assigned',
  packageCount: 1,
  estimatedTime: '20 min',
}

// Change earnings
today: { amount: 200.00, deliveries: 10 }

// Change driver name
name: 'Your Name'
```

---

## 🎨 Customize Colors

Edit `src/theme/index.js`:

```javascript
export const colors = {
  primary: "#YOUR_COLOR", // Change app color
  // ...
};
```

Then restart the app to see changes.

---

## 🐛 Troubleshooting

### App won't start?

```powershell
# Clear Expo cache
npm start -- --clear
```

### QR code won't scan?

- Ensure phone and computer are on **same WiFi**
- Press `w` to test in browser first
- Press `a` or `i` to use emulator/simulator

### Expo Go shows error?

```powershell
# Restart with clean cache
npm start -- --clear
```

---

## 📦 Project Structure (Quick Reference)

```
driver app/
├── App.js              # Navigation setup
├── src/
│   ├── screens/       # 5 screens
│   ├── components/    # 3 reusable components
│   ├── data/          # mock.js (edit this!)
│   └── theme/         # Design tokens (colors, spacing)
└── package.json       # Dependencies
```

---

## 🎯 Navigation Map

```
Login Screen
    ↓ (Quick Demo Login)
Main App (Bottom Tabs)
├─ 🏠 Home
│  └─ Tap delivery → DeliveryDetails (modal)
├─ 💰 Earnings
└─ 👤 Profile
   └─ Logout → Back to Login
```

---

## ✨ Cool Features to Notice

1. **Status Colors**

   - Blue badge = Assigned
   - Amber badge = In Progress
   - Green badge = Delivered

2. **Emoji Icons Everywhere**

   - No icon library needed
   - Universal and fun

3. **Smart Stats**

   - All earnings stats are **calculated** from mock data
   - Avg per delivery = total / deliveries
   - Per hour = total / hours

4. **Photo Upload Flow**

   - Can't mark delivered without photo
   - Realistic validation

5. **Alert Confirmations**
   - Logout asks for confirmation
   - Issue reporting shows options

---

## 🎨 Design Details

- **Cards:** 12px rounded corners, subtle shadow
- **Buttons:** 56px height (easy to tap)
- **Spacing:** Consistent 16px/24px padding
- **Typography:** Clear hierarchy (32px → 12px)
- **Colors:** Professional blue theme

---

## 📱 Tested On

- ✅ Android (recommended: Android 10+)
- ✅ iOS (recommended: iOS 13+)
- ✅ Various screen sizes

---

## 🆘 Need Help?

1. Check `README.md` for detailed setup
2. Check `PROJECT_SUMMARY.md` for what was built
3. Check `DESIGN_COMPARISON.md` for design decisions

---

## 🎉 You're Ready!

The app is **100% functional** as a demo. All screens work, all navigation flows, all mock data displays correctly.

**Enjoy exploring the app!** 🚗💨

---

Built with ❤️ using React Native
