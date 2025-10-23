import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, GestureResponderEvent, Animated, Modal, TextInput, PanResponder, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { saveNote, getUserPreferences } from '@/lib/storage';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/use-theme';

export default function RecordingScreen() {
  const { theme, isDark } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const panAnim = useRef(new Animated.Value(0)).current; // for subtle pulse
  const [transcript, setTranscript] = useState('');
  const [showReview, setShowReview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  
  // Swipe up animation values
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const swipeHintAnim = useRef(new Animated.Value(0)).current;
  const swipeProgress = useRef(new Animated.Value(0)).current;
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(panAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(panAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [panAnim]);

  // Swipe hint animation
  useEffect(() => {
    if (!isRecording && !isProcessing) {
      const hintLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(swipeHintAnim, { 
            toValue: 1, 
            duration: 2000, 
            useNativeDriver: true 
          }),
          Animated.timing(swipeHintAnim, { 
            toValue: 0, 
            duration: 2000, 
            useNativeDriver: true 
          }),
        ])
      );
      hintLoop.start();
      return () => hintLoop.stop();
    }
  }, [isRecording, isProcessing, swipeHintAnim]);

  // Load user's selected language
  useEffect(() => {
    const loadUserLanguage = async () => {
      try {
        const preferences = await getUserPreferences();
        setSelectedLanguage(preferences.selectedLanguage);
      } catch (error) {
        console.error('Error loading user language:', error);
      }
    };
    loadUserLanguage();
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const audioPerm = await Audio.requestPermissionsAsync();
    return audioPerm.status === 'granted';
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => setElapsedMs((t) => t + 1000), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startRecording = useCallback(async () => {
    const ok = await requestPermissions();
    if (!ok) return;
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setElapsedMs(0);
      startTimer();
      // Try to start STT if native module is available (dev build)
      try {
        const voice = await import('@react-native-voice/voice');
        // @ts-ignore runtime guard
        voice.default.onSpeechResults = (e: any) => {
          const values: string[] = e.value || [];
          if (values.length) setTranscript(values[0]);
        };
        // @ts-ignore runtime guard
        voice.default.onSpeechError = () => {};
        // @ts-ignore runtime guard
        await voice.default.start(selectedLanguage);
      } catch {
        // Expo Go path: STT unavailable, continue recording only
      }
      } catch {
        // noop for MVP
      }
  }, [requestPermissions, selectedLanguage]);

  const stopRecording = useCallback(async () => {
    try {
      stopTimer();
      setIsProcessing(true);
      
      // Processing animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (recording) {
        await recording.stopAndUnloadAsync();
      }
      try {
        const voice = await import('@react-native-voice/voice');
        // @ts-ignore
        await voice.default.stop();
      } catch {}
    } catch {}
    setIsRecording(false);
    setIsProcessing(false);
    setShowReview(true);
  }, [recording, scaleAnim]);

  const onMicPress = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  const onSwipeUp = useCallback((e: GestureResponderEvent) => {
    startRecording();
  }, [startRecording]);

  // Pan responder for swipe up gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isRecording && !isProcessing,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10 && gestureState.dy < 0; // Only respond to upward swipes
      },
      onPanResponderGrant: () => {
        setIsSwipeActive(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) { // Only track upward movement
          const distance = Math.abs(gestureState.dy);
          setSwipeDistance(distance);
          const progress = Math.min(distance / 100, 1); // Max progress at 100px
          swipeProgress.setValue(progress);
          swipeAnim.setValue(progress * 20); // Move up to 20px
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const distance = Math.abs(gestureState.dy);
        const velocity = Math.abs(gestureState.vy);
        
        // Trigger recording if swipe distance > 60px or velocity > 0.5
        if (distance > 60 || velocity > 0.5) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSwipeUp({} as GestureResponderEvent);
        }
        
        // Reset animations
        Animated.parallel([
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(swipeProgress, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]).start();
        
        setIsSwipeActive(false);
        setSwipeDistance(0);
      },
    })
  ).current;

  const minutes = Math.floor(elapsedMs / 60000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((elapsedMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 48,
    },
    headerLeft: {
      flex: 1,
    },
    settingsButton: {
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    settingsButtonText: {
      fontSize: 20,
      color: theme.text,
    },
    title: {
      color: theme.text,
      fontSize: 36,
      fontWeight: '700',
      marginBottom: 12,
      letterSpacing: -0.8,
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 18,
      lineHeight: 26,
      maxWidth: 280,
    },
    mainContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerContainer: {
      alignItems: 'center',
      marginBottom: 80,
    },
    timer: {
      color: theme.text,
      fontSize: 56,
      fontWeight: '300',
      fontVariant: ['tabular-nums'],
      letterSpacing: 3,
    },
    recordingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      backgroundColor: theme.error,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 24,
      shadowColor: theme.error,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    recordingDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.textInverse,
      marginRight: 10,
    },
    recordingText: {
      color: theme.textInverse,
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 1.2,
    },
    micContainer: {
      alignItems: 'center',
      marginBottom: 60,
      position: 'relative',
    },
    micButtonWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    micButton: {
      padding: 12,
    },
    micButtonPressed: {
      opacity: 0.9,
    },
    micButtonInner: {
      width: 200,
      height: 200,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 12,
    },
    swipeHint: {
      position: 'absolute',
      top: -50,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    swipeHintText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.5,
      textAlign: 'center',
      backgroundColor: theme.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    swipeProgress: {
      position: 'absolute',
      top: -30,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 5,
    },
    swipeProgressBar: {
      width: 4,
      height: 20,
      backgroundColor: theme.primary,
      borderRadius: 2,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 4,
    },
    micIcon: {
      color: theme.textInverse,
      fontSize: 80,
      fontWeight: 'bold',
    },
    hint: {
      color: theme.textSecondary,
      fontSize: 18,
      textAlign: 'center',
      lineHeight: 26,
      maxWidth: 320,
      fontWeight: '400',
    },
    bottomNav: {
      alignItems: 'center',
      paddingTop: 24,
    },
    notesButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    notesButtonIcon: {
      fontSize: 20,
      marginRight: 10,
    },
    notesButtonText: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '600',
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'flex-end',
    },
    modalCard: {
      backgroundColor: theme.surface,
      padding: 32,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      minHeight: '50%',
      borderTopWidth: 1,
      borderTopColor: theme.border,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    modalTitle: {
      color: theme.text,
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 24,
      textAlign: 'center',
    },
    input: {
      color: theme.text,
      backgroundColor: theme.background,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 24,
      minHeight: 240,
      textAlignVertical: 'top',
      fontSize: 18,
      lineHeight: 26,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 20,
      marginTop: 32,
      justifyContent: 'center',
    },
    actionBtn: {
      paddingHorizontal: 32,
      paddingVertical: 18,
      borderRadius: 16,
      minWidth: 140,
      alignItems: 'center',
    },
    save: { 
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    cancel: { 
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    actionText: { 
      color: theme.textInverse, 
      fontWeight: '600',
      fontSize: 18,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Murmur</Text>
          <Text style={styles.subtitle}>
            {isProcessing ? 'Processing…' : isSpeaking ? 'Speaking…' : isRecording ? 'Recording…' : 'Your thoughts, amplified'}
          </Text>
        </View>
        <Pressable 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </Pressable>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{minutes}:{seconds}</Text>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>REC</Text>
            </View>
          )}
        </View>

        {/* Microphone Button */}
        <View style={styles.micContainer}>
          {/* Swipe up hint animation */}
          {!isRecording && !isProcessing && (
            <Animated.View
              style={[
                styles.swipeHint,
                {
                  opacity: swipeHintAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                  transform: [
                    {
                      translateY: swipeHintAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -8],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.swipeHintText}>↑ Swipe up to record</Text>
            </Animated.View>
          )}

          {/* Swipe progress indicator */}
          {isSwipeActive && (
            <Animated.View
              style={[
                styles.swipeProgress,
                {
                  opacity: swipeProgress,
                  transform: [
                    {
                      scale: swipeProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.swipeProgressBar} />
            </Animated.View>
          )}

          <Animated.View
            style={[
              styles.micButtonWrapper,
              {
                transform: [
                  {
                    translateY: swipeAnim,
                  },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Pressable
              onPress={onMicPress}
              style={({ pressed }) => [styles.micButton, pressed && styles.micButtonPressed]}
              android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
            >
              <Animated.View
                style={[
                  styles.micButtonInner,
                  {
                    backgroundColor: isProcessing ? '#ff6b35' : isSpeaking ? '#4CAF50' : '#0066ff',
                    transform: [
                      {
                        scale: Animated.multiply(
                          panAnim.interpolate({ inputRange: [0, 1], outputRange: [1, isRecording ? 1.06 : 1] }),
                          scaleAnim
                        ),
                      },
                    ],
                    shadowOpacity: isSwipeActive ? 0.6 : 0.3,
                  },
                ]}
              >
                <Text style={styles.micIcon}>
                  {isProcessing ? '⚡' : isSpeaking ? '🔊' : '●'}
                </Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Hint Text */}
        <Text style={styles.hint}>
          {isRecording ? 'Tap to stop recording' : 'Tap to start recording • Swipe up for quick-start'}
        </Text>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable 
          style={styles.notesButton}
          onPress={() => router.push('/notes')}
          android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: true }}
        >
          <Text style={styles.notesButtonIcon}>📝</Text>
          <Text style={styles.notesButtonText}>Notes</Text>
        </Pressable>
      </View>

      {/* Review Modal */}
      <Modal transparent visible={showReview} animationType="slide" onRequestClose={() => setShowReview(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Review</Text>
            <TextInput
              style={styles.input}
              multiline
              value={transcript}
              placeholder="Transcription"
              placeholderTextColor="#666"
              onChangeText={setTranscript}
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.actionBtn, styles.cancel]} onPress={() => { 
                setShowReview(false); 
                setTranscript(''); 
                setElapsedMs(0); // Reset timer when discarding
              }}>
                <Text style={styles.actionText}>Discard</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, styles.save]}
                onPress={async () => {
                  const now = Date.now();
                  await saveNote({ id: String(now), text: transcript.trim(), createdAt: now, modifiedAt: now });
                  setShowReview(false);
                  setTranscript('');
                  
                  // Reset recorder after saving
                  setElapsedMs(0);
                }}
              >
                <Text style={styles.actionText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}



