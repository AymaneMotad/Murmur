import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, GestureResponderEvent, Animated, Modal, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { saveNote, getUserPreferences } from '@/lib/storage';

export default function RecordingScreen() {
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
    // MVP: provide audible feedback using TTS
    setIsSpeaking(true);
    Speech.speak('Recording started', { rate: 1.0, onDone: () => setIsSpeaking(false) });
    startRecording();
  }, [startRecording]);

  const minutes = Math.floor(elapsedMs / 60000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((elapsedMs % 60000) / 1000)
    .toString()
    .padStart(2, '0');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
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
          <Pressable
            onPress={onMicPress}
            onLongPress={onSwipeUp}
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
                }
              ]}
            >
              <Text style={styles.micIcon}>
                {isProcessing ? '⚡' : isSpeaking ? '🔊' : '●'}
              </Text>
            </Animated.View>
          </Pressable>
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
              <Pressable style={[styles.actionBtn, styles.cancel]} onPress={() => { setShowReview(false); setTranscript(''); }}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  headerLeft: {
    flex: 1,
  },
  settingsButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1a1d2e',
    borderWidth: 1,
    borderColor: '#2a2f38',
  },
  settingsButtonText: {
    fontSize: 20,
    color: '#ffffff',
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9BA1A6',
    fontSize: 16,
    lineHeight: 24,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  timer: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginRight: 8,
  },
  recordingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  micContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  micButton: {
    padding: 8,
  },
  micButtonPressed: {
    opacity: 0.9,
  },
  micButtonInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  micIcon: {
    color: '#fff',
    fontSize: 72,
    fontWeight: 'bold',
  },
  hint: {
    color: '#9BA1A6',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  bottomNav: {
    alignItems: 'center',
    paddingTop: 20,
  },
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d2e',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#2a2f38',
  },
  notesButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  notesButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1a1d2e',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '50%',
    borderTopWidth: 1,
    borderTopColor: '#2a2f38',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    color: '#ffffff',
    backgroundColor: '#0f1419',
    borderColor: '#2a2f38',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    justifyContent: 'center',
  },
  actionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  save: { 
    backgroundColor: '#0066ff',
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cancel: { 
    backgroundColor: '#2a2f38',
    borderWidth: 1,
    borderColor: '#3a3f48',
  },
  actionText: { 
    color: '#ffffff', 
    fontWeight: '600',
    fontSize: 16,
  },
});


