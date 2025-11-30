# 📱 Expo Go - Complete Setup Guide

## 🎯 What is Expo Go?

**Expo Go** is a free mobile app that lets you run React Native apps **instantly** on your phone without building or compiling. No Android Studio, no Xcode needed!

---

## ✅ Step-by-Step Setup

### 1. Install Expo Go on Your Phone

📱 **iPhone (iOS)**

- Open App Store
- Search "Expo Go"
- Install the app

📱 **Android**

- Open Play Store
- Search "Expo Go"
- Install the app

### 2. Install Dependencies on Your Computer

Open PowerShell and run:

```powershell
cd "c:\Users\moham\OneDrive\Desktop\big project\driver app"
npm install
```

This takes about 2-3 minutes the first time.

### 3. Start the Expo Development Server

```powershell
npm start
```

You'll see:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or Camera (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

### 4. Open App on Your Phone

**iPhone:**

1. Open your Camera app
2. Point at the QR code
3. Tap the notification
4. App opens in Expo Go!

**Android:**

1. Open Expo Go app
2. Tap "Scan QR Code"
3. Scan the code
4. App loads!

---

## 🎉 That's It!

The app is now running on your phone! Any code changes you make will automatically reload in the app.

---

## 🔄 Development Workflow

### Make Changes

1. Edit any file (e.g., `src/screens/HomeScreen.js`)
2. Save the file
3. App automatically reloads on your phone!

### Shake to Open Developer Menu

- **iOS**: Shake your phone
- **Android**: Shake or press hardware menu button

Developer menu options:

- Reload
- Toggle Performance Monitor
- Toggle Element Inspector
- Debug Remote JS (advanced)

---

## 📡 Network Requirements

**IMPORTANT:** Your phone and computer must be on the **same WiFi network**.

### If QR Code Won't Work:

**Option 1: Use Tunnel Mode**

```powershell
npm start -- --tunnel
```

This works even on different networks (slower).

**Option 2: Use LAN Mode (default)**

```powershell
npm start -- --lan
```

**Option 3: Use Localhost (same device only)**

```powershell
npm start -- --localhost
```

---

## 🎨 Features in Expo Go

✅ **Hot Reloading** - Changes appear instantly  
✅ **Error Overlay** - See errors on your phone screen  
✅ **Performance Monitor** - Check FPS and memory  
✅ **Element Inspector** - Tap to inspect components  
✅ **Remote Debugging** - Use Chrome DevTools  
✅ **Console Logs** - See in terminal on your computer

---

## 🚀 Quick Commands

```powershell
# Start normally
npm start

# Start with clear cache (fixes most issues)
npm start -- --clear

# Start with tunnel (for different networks)
npm start -- --tunnel

# Open on Android emulator
npm start
# Then press 'a'

# Open on iOS simulator (Mac only)
npm start
# Then press 'i'

# Open in web browser
npm start
# Then press 'w'
```

---

## 🐛 Troubleshooting

### QR Code Won't Scan

**Solution 1:** Make sure both devices on same WiFi
**Solution 2:** Use tunnel mode: `npm start -- --tunnel`
**Solution 3:** Manually type the URL in Expo Go:

- In Expo Go app → "Enter URL manually"
- Type: `exp://192.168.x.x:8081` (from terminal)

### App Shows White Screen

**Solution:** Clear cache and restart

```powershell
npm start -- --clear
```

### "Network Response Timed Out"

**Solution:** Check firewall settings, allow Node.js

### Changes Not Appearing

**Solution:** Shake phone → Reload

### App Crashes

**Solution 1:** Check terminal for errors  
**Solution 2:** Restart Expo: `Ctrl+C`, then `npm start`  
**Solution 3:** Reinstall dependencies: `rm -rf node_modules && npm install`

---

## 📱 Testing on Multiple Devices

You can open the same QR code on multiple phones simultaneously!

1. Start app: `npm start`
2. Scan QR on Phone 1
3. Scan same QR on Phone 2
4. Both phones run the app!

---

## 💡 Pro Tips

### 1. Fast Refresh

Expo has **Fast Refresh** enabled by default:

- Most changes reload instantly
- Component state is preserved
- Only changed components re-render

### 2. Developer Menu

Shake your phone to access:

- Reload app
- Toggle Performance Monitor
- Enable Element Inspector
- Debug remotely

### 3. Console Logs

All `console.log()` appear in your terminal!

### 4. Error Messages

Errors show as red overlay on phone with:

- Stack trace
- Line numbers
- Fix suggestions

---

## 🎯 Common Development Tasks

### View Logs

All console.logs appear in terminal automatically

### Debug Layout

1. Shake phone
2. Toggle Element Inspector
3. Tap any element to see styles

### Check Performance

1. Shake phone
2. Toggle Performance Monitor
3. See FPS and memory usage

### Reload App

- Shake phone → Reload
- Or press `r` in terminal

---

## 📦 What's Running?

When you run `npm start`:

1. **Metro Bundler** starts (JavaScript bundler)
2. **Expo Dev Server** starts (serves your app)
3. **QR Code** appears (connects phone to server)
4. Your phone downloads JavaScript bundle
5. App runs in **Expo Go** sandbox

---

## 🔄 How Updates Work

1. You save a file
2. Metro detects the change
3. Rebundles that file
4. Sends update to phone
5. App reloads (fast refresh)
6. Changes appear!

**All in under 1 second!** ⚡

---

## ✨ Advantages of Expo Go

✅ **No Build Required** - Run immediately  
✅ **No Xcode/Android Studio** - Just Node.js  
✅ **Instant Updates** - Changes appear live  
✅ **Easy Sharing** - Share QR code with team  
✅ **Cross-Platform** - Same code, iOS + Android  
✅ **Free Forever** - No cost, no limits

---

## 📱 Expo Go App Features

In the Expo Go app:

- **Home Tab** - Your recent projects
- **Profile Tab** - Your published apps
- **Explore Tab** - Example apps
- **Scan QR** - Open new projects

---

## 🎓 Learning Resources

- [Expo Docs](https://docs.expo.dev)
- [React Navigation Docs](https://reactnavigation.org)
- [React Native Docs](https://reactnative.dev)

---

## 🚀 Next Steps After Expo Go

Once ready for production:

```bash
# Build standalone app (optional, later)
npx expo build:android
npx expo build:ios
```

But for development, **Expo Go is perfect!** ✨

---

**Enjoy building with Expo Go!** 📱🚀
