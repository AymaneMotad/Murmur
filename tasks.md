# Murmur Tasks (from PRD)

## Phase 1 (MVP)
- Splash screen: dark gradient vibe, logo, tagline, smooth transition
- Recording screen (home): large mic button, timer, states (idle/recording/processing), swipe-up hint
- Speech-to-text: simplest stable path (Expo-first), consider native OS STT later
- Edit/review modal: show transcription, save/discard, add reminder launcher
- Local storage: notes model, AsyncStorage (MVP)
- Notes list: grouped by date (Today/Yesterday/This Week/Earlier), swipe actions

## Phase 2
- Reminder system: local notifications, deep link to note
- UI polish: animations, haptics
- Gesture refinements

## Phase 3
- Testing & optimization, store prep

## Technical decisions
- Routing: expo-router (file-based)
- Theming: dark-first palette (#1a1d2e, #0f1419, accent #0066ff)
- STT: start with simple library approach; revisit native SFSpeechRecognizer/Android SR if needed
- Audio: expo-av for recording; expo-speech for TTS (fast feedback loop)

## Immediate Tasks
1) Clean template; remove example tabs/screens
2) Update splash (dark), app name: Murmur
3) Add audio + speech deps
4) Scaffold recording screen with swipe-up + TTS
5) Wire minimal storage for saved notes (placeholder)
