# Quick Start Guide

## 1. Setup

```bash
cd /Users/arun/Downloads/repurpose-app
npm install
```

## 2. Run on Device or Simulator

### iOS (Mac only)
```bash
# Start development server
npx expo start

# In terminal, press 'i' to open iOS Simulator
# Or scan QR code with iOS Expo app on real device
```

### Android
```bash
# Start development server
npx expo start

# In terminal, press 'a' to open Android Emulator
# Or scan QR code with Android Expo app on real device
```

### Web (Testing in Browser)
```bash
npx expo start --web
# Press 'w' to open in browser
```

## 3. App Flow

### First Launch
1. **Onboarding** — Set up brand voice
   - View grid of supported formats
   - Paste 3–5 sample posts
   - AI analyzes tone, length, CTAs
   - View extracted voice traits

### Main Navigation (Tab Bar)
- **Home** — Recent projects, usage stats, quick actions
- **Library** — All projects, searchable, filterable by format
- **Settings** — Profile, brand voices, preferences

### Creating a Repurpose
1. Click "+ New repurpose"
2. **Step 1**: Add input (video, transcript, caption, rough idea)
3. **Step 2**: Select output formats (12+ options)
4. **Step 3**: Generate outputs (see real-time progress)
5. **Results**: Edit, copy, share, or save each output

## 4. Key Features Implemented

✅ **Screens**: 6 full screens with proper navigation
✅ **State Management**: React hooks for tab navigation & flow
✅ **Components**: Reusable Button, Card, MonoChip
✅ **Design System**: Dark theme with green accent
✅ **Data Driving**: 12 platform formats, sample projects, mock data
✅ **Interactions**: Modals, switches, scrolling, lists, buttons
✅ **Loading States**: Progress indicators during generation

## 5. Development Tips

- Edit screens in `src/screens/`
- Update colors in `src/data/constants.ts`
- Add new platforms in `PLATFORMS` array
- Modify onboarding in `OnboardingScreen.tsx`
- Test UI responsiveness with device simulator

## 6. Building for App Stores

### iOS
```bash
npx eas build --platform ios
```

### Android
```bash
npx eas build --platform android
```

(Requires EAS account: https://expo.dev)

## 7. Project Structure

```
repurpose-app/
├── src/
│   ├── app/
│   │   └── index.tsx              # Main navigation hub
│   ├── screens/                   # 6 main screens
│   │   ├── OnboardingScreen.tsx   # Brand voice setup
│   │   ├── HomeScreen.tsx         # Tab: Home
│   │   ├── LibraryScreen.tsx      # Tab: Library
│   │   ├── SettingsScreen.tsx     # Tab: Settings
│   │   ├── NewRepurposeScreen.tsx # Modal: 3-step flow
│   │   └── ResultsScreen.tsx      # Modal: Results + editor
│   ├── components/                # Reusable UI
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── MonoChip.tsx
│   └── data/
│       └── constants.ts           # Theme, platforms, mock data
├── app.json                       # Expo config
├── package.json
└── README.md
```

## 8. Troubleshooting

**Won't start?**
```bash
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

**Simulator not opening?**
```bash
# iOS
xcrun simctl erase all
npx expo run:ios

# Android
emulator -avd Pixel_4_API_31
npx expo run:android
```

**Need to reset everything?**
```bash
npm run reset-project
```

---

Ready to build! 🚀
