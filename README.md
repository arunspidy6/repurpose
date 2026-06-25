# Repurpose — Content Variation Engine

A React Native mobile app (iOS & Android) built with Expo that turns any video, clip, caption, or idea into platform-native content.

## Features

- **Onboarding Flow**: Brand voice setup from sample posts
- **Content Repurposing**: Convert long-form content into 12+ social media formats
- **Multi-Platform Support**: YouTube, TikTok, Instagram, LinkedIn, Twitter/X, and more
- **Smart Editing**: In-app editor with regeneration and variation features
- **Project Library**: Organize and search all repurposed content
- **Brand Voices**: Support for multiple writing styles and tones
- **Export Options**: Share directly or use scheduler integration

## Supported Formats

- Hook variations
- Shorts/Reels scripts
- Captions & variants
- LinkedIn posts
- Twitter/X threads
- Carousel posts
- Newsletter intros
- YouTube titles & thumbnails
- A/B test versions
- Trend remixes

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for tab-based navigation
- **Native styling** with StyleSheet (no external UI library)

## Project Structure

```
src/
├── app/
│   └── index.tsx           # Main app entry point
├── screens/
│   ├── OnboardingScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LibraryScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── NewRepurposeScreen.tsx
│   └── ResultsScreen.tsx
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   └── MonoChip.tsx
└── data/
    └── constants.ts        # Colors, platforms, sample data
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (Mac only)
- Android: Android Studio & JDK 17+

### Installation

```bash
cd repurpose-app
npm install
```

### Running on iOS
```bash
npx expo run:ios
```

Or with Xcode simulator:
```bash
npx expo start
# Press 'i' in terminal
```

### Running on Android
```bash
npx expo run:android
```

Or with Android emulator:
```bash
npx expo start
# Press 'a' in terminal
```

### Web (Development)
```bash
npx expo start --web
# Press 'w' in terminal
```

## Build for Distribution

### iOS
```bash
npx eas build --platform ios
```

### Android
```bash
npx eas build --platform android
```

## Design System

**Colors** (Dark theme):
- Background: `#0a0a0b`
- Cards: `#141416`
- Accent (Green): `#2fe39b`
- Text: `#f4f4f6`
- Muted Text: `rgba(244,244,246,0.55)`

**Components**:
- Buttons (primary, secondary, ghost)
- Cards (rounded, bordered)
- MonoChip badges
- Tab navigation with icons

## Future Enhancements

- AI-powered content generation (OpenAI integration)
- Direct platform publishing (Instagram, TikTok APIs)
- Analytics dashboard
- Collaboration features
- Advanced scheduling
- Content templates library
