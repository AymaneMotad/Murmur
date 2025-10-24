import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Modal, TextInput, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { saveNote } from '@/lib/storage';
import { useTheme } from '@/hooks/use-theme';

const { width, height } = Dimensions.get('window');

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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Simple pulse animation for the recording button
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  // Simple pulse animation for recording button when not recording
  useEffect(() => {
    if (!isRecording && !isProcessing) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { 
            toValue: 1.05, 
            duration: 1000, 
            useNativeDriver: true 
          }),
          Animated.timing(pulseAnim, { 
            toValue: 1, 
            duration: 1000, 
            useNativeDriver: true 
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    }
  }, [isRecording, isProcessing, pulseAnim]);


  // Request microphone permissions from the user
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const audioPerm = await Audio.requestPermissionsAsync();
    return audioPerm.status === 'granted';
  }, []);

  // Start the recording timer
  const startTimer = () => {
    timerRef.current = setInterval(() => setElapsedMs((t) => t + 1000), 1000);
  };
  
  // Stop the recording timer
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // Start recording audio
  const startRecording = useCallback(async () => {
    try {
      // First, ask for microphone permission
      const ok = await requestPermissions();
      if (!ok) {
        console.log('Permission denied');
        return;
      }
      
      // Configure audio settings for recording
      await Audio.setAudioModeAsync({ 
        allowsRecordingIOS: true, 
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });
      
      // Create a new recording instance
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      // Update state and start timer
      setRecording(recording);
      setIsRecording(true);
      setElapsedMs(0);
      startTimer();
      
      // Start speech recognition if available
      try {
        const voice = await import('@react-native-voice/voice');
        voice.default.onSpeechResults = (e: any) => {
          const values: string[] = e.value || [];
          if (values.length > 0) {
            setTranscript(values[0]);
          }
        };
        voice.default.onSpeechError = (e: any) => {
          console.log('Speech recognition error:', e.error);
        };
        await voice.default.start('en-US');
        console.log('Speech recognition started');
      } catch (error) {
        console.log('Speech recognition not available:', error);
        // Continue without speech recognition
      }
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  }, [requestPermissions]);

  // Stop recording audio
  const stopRecording = useCallback(async () => {
    try {
      // Stop the timer and show processing state
      stopTimer();
      setIsProcessing(true);
      
      // Play a simple processing animation
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

      // Stop the recording
      if (recording) {
        await recording.stopAndUnloadAsync();
        console.log('Recording stopped successfully');
      }
      
      // Stop speech recognition if it was started
      try {
        const voice = await import('@react-native-voice/voice');
        await voice.default.stop();
        console.log('Speech recognition stopped');
      } catch (error) {
        console.log('Speech recognition stop error:', error);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
    
    // Update state and show review modal
    setIsRecording(false);
    setIsProcessing(false);
    
    // If no transcript was captured, provide a placeholder
    if (!transcript.trim()) {
      setTranscript('Tap to add your notes...');
    }
    
    setShowReview(true);
  }, [recording, scaleAnim, transcript]);

  // Handle microphone button press - toggle recording
  const onMicPress = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Calculate minutes and seconds for display
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
      paddingHorizontal: Math.max(20, width * 0.05), // Responsive padding
      paddingTop: Math.max(60, height * 0.08), // Responsive top padding
      paddingBottom: Math.max(40, height * 0.05), // Responsive bottom padding
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
      fontSize: Math.max(28, width * 0.08), // Responsive font size
      fontWeight: '700',
      marginBottom: 12,
      letterSpacing: -0.8,
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: Math.max(16, width * 0.045), // Responsive font size
      lineHeight: Math.max(24, width * 0.06), // Responsive line height
      maxWidth: Math.min(320, width * 0.8), // Responsive max width
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
      fontSize: Math.max(40, width * 0.12), // Responsive timer font size
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
      width: Math.max(160, Math.min(220, width * 0.5)), // Responsive mic button size
      height: Math.max(160, Math.min(220, width * 0.5)), // Responsive mic button size
      borderRadius: Math.max(80, Math.min(110, width * 0.25)), // Responsive border radius
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 12,
    },
    micIcon: {
      color: theme.textInverse,
      fontSize: Math.max(60, width * 0.18), // Responsive icon size
      fontWeight: 'bold',
    },
    hint: {
      color: theme.textSecondary,
      fontSize: Math.max(16, width * 0.045), // Responsive font size
      textAlign: 'center',
      lineHeight: Math.max(24, width * 0.06), // Responsive line height
      maxWidth: Math.min(350, width * 0.85), // Responsive max width
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
            {isProcessing ? 'Processing your recording…' : isRecording ? 'Recording…' : 'Your thoughts, amplified'}
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
          <Animated.View
            style={[
              styles.micButtonWrapper,
              {
                transform: [
                  {
                    scale: pulseAnim,
                  },
                ],
              },
            ]}
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
                    backgroundColor: isProcessing ? '#ff6b35' : '#0066ff',
                    transform: [
                      {
                        scale: Animated.multiply(
                          panAnim.interpolate({ inputRange: [0, 1], outputRange: [1, isRecording ? 1.06 : 1] }),
                          scaleAnim
                        ),
                      },
                    ],
                    shadowOpacity: 0.3,
                  },
                ]}
              >
                <Text style={styles.micIcon}>
                  {isProcessing ? '⚡' : '●'}
                </Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Hint Text */}
        <Text style={styles.hint}>
          {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
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
              placeholder="Your notes will appear here..."
              placeholderTextColor="#666"
              onChangeText={setTranscript}
              autoFocus={!transcript || transcript === 'Tap to add your notes...'}
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



