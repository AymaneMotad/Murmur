import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, GestureResponderEvent, Animated, Modal, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio, PermissionResponse } from 'expo-av';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { saveNote } from '@/lib/storage';

export default function RecordingScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const panAnim = useRef(new Animated.Value(0)).current; // for subtle pulse
  const [transcript, setTranscript] = useState('');
  const [showReview, setShowReview] = useState(false);

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

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const audioPerm: PermissionResponse = await Audio.requestPermissionsAsync();
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
        await voice.default.start('en-US');
      } catch {
        // Expo Go path: STT unavailable, continue recording only
      }
    } catch (e) {
      // noop for MVP
    }
  }, [requestPermissions]);

  const stopRecording = useCallback(async () => {
    try {
      stopTimer();
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
    setShowReview(true);
  }, [recording]);

  const onMicPress = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  const onSwipeUp = useCallback((e: GestureResponderEvent) => {
    // MVP: provide audible feedback using TTS
    Speech.speak('Recording started', { rate: 1.0 });
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
      <Text style={styles.title}>Murmur</Text>
      <Text style={styles.subtitle}>{isRecording ? 'Recording…' : 'Tap or swipe up to record'}</Text>
      <Text style={styles.timer}>{minutes}:{seconds}</Text>

      <Pressable
        onPress={onMicPress}
        onLongPress={onSwipeUp}
        style={({ pressed }) => [styles.micButton, pressed && styles.micButtonPressed]}
        android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
      >
        <Animated.View
          style={{
            width: 168,
            height: 168,
            borderRadius: 84,
            backgroundColor: '#0066ff',
            transform: [
              {
                scale: panAnim.interpolate({ inputRange: [0, 1], outputRange: [1, isRecording ? 1.06 : 1] }),
              },
            ],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={styles.micIcon}>🎙️</Text>
        </Animated.View>
      </Pressable>

      <Text style={styles.hint}>Swipe up to quick-start</Text>

      {/* Floating Notes Button */}
      <Pressable 
        style={styles.floatingButton}
        onPress={() => router.push('/notes')}
        android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: true }}
      >
        <Text style={styles.floatingButtonText}>📝</Text>
      </Pressable>

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
                  Speech.speak('Note saved successfully');
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 12,
  },
  timer: {
    color: '#ffffff',
    fontSize: 32,
    fontVariant: ['tabular-nums'],
    marginBottom: 24,
  },
  micButton: {
    marginVertical: 12,
  },
  micButtonPressed: {
    opacity: 0.9,
  },
  micIcon: {
    color: '#fff',
    fontSize: 48,
  },
  hint: {
    color: '#666',
    marginTop: 24,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonText: {
    fontSize: 24,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#11151b',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: '50%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    color: '#fff',
    backgroundColor: '#0b0f14',
    borderColor: '#222831',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 180,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  save: { backgroundColor: '#0066ff' },
  cancel: { backgroundColor: '#2a2f38' },
  actionText: { color: '#fff', fontWeight: '600' },
});


