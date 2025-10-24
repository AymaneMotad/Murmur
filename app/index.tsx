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
  
  // For handling long recordings
  const [speechTimeout, setSpeechTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (speechTimeout) {
        clearTimeout(speechTimeout);
      }
    };
  }, [speechTimeout]);


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
  
  // Restart speech recognition for long recordings
  const restartSpeechRecognition = useCallback(async () => {
    try {
      const voice = await import('@react-native-voice/voice');
      
      // Stop current recognition
      await voice.default.stop();
      
      // Clear handlers and set up new ones
      voice.default.removeAllListeners();
      
      voice.default.onSpeechStart = () => {
        console.log('Speech recognition restarted');
      };
      
      voice.default.onSpeechResults = (e: any) => {
        console.log('Speech results received (restart):', e);
        if (e.value && e.value.length > 0) {
          // For restarts, append to existing transcript
          const newText = e.value[0];
          setTranscript(prev => prev + (prev ? ' ' : '') + newText);
        }
      };
      
      voice.default.onSpeechError = (e: any) => {
        console.log('Speech error (restart):', e.error);
      };
      
      // Start again
      await voice.default.start('en-US');
      console.log('Speech recognition restarted successfully');
      
    } catch (error) {
      console.log('Failed to restart speech recognition:', error);
    }
  }, []);

  // Start recording audio
  const startRecording = useCallback(async () => {
    try {
      // Reset transcript state before starting
      setTranscript('');
      
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
      
      // Start speech recognition following official docs
      try {
        const voice = await import('@react-native-voice/voice');
        
        // Clean up any existing voice recognition first
        try {
          await voice.default.destroy();
        } catch {
          // Ignore if already destroyed
        }
        
        // Check if speech recognition is available
        const isAvailable = await voice.default.isAvailable();
        console.log('Speech recognition available:', isAvailable);
        
        if (isAvailable) {
          // Clear any existing handlers first
          voice.default.removeAllListeners();
          
          // Set up handlers following the official pattern
          voice.default.onSpeechStart = () => {
            console.log('Speech recognition started');
          };
          
          voice.default.onSpeechEnd = () => {
            console.log('Speech recognition ended');
          };
          
          voice.default.onSpeechResults = (e: any) => {
            console.log('Speech results received:', e);
            if (e.value && e.value.length > 0) {
              // Use the latest result directly, don't accumulate
              setTranscript(e.value[0]);
            }
          };
          
          voice.default.onSpeechError = (e: any) => {
            console.log('Speech error:', e.error);
          };
          
          // Start speech recognition
          await voice.default.start('en-US');
          console.log('Speech recognition started successfully');
          
          // Set up timeout to restart speech recognition for long recordings (every 30 seconds)
          const timeout = setTimeout(() => {
            console.log('Restarting speech recognition for long recording...');
            restartSpeechRecognition();
          }, 30000); // 30 seconds
          
          setSpeechTimeout(timeout);
        } else {
          console.log('Speech recognition not available on this device');
        }
        
      } catch (error) {
        console.log('Speech recognition setup failed:', error);
      }
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  }, [requestPermissions, restartSpeechRecognition]);

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
      
      // Clear speech timeout
      if (speechTimeout) {
        clearTimeout(speechTimeout);
        setSpeechTimeout(null);
      }
      
      // Stop speech recognition
      try {
        const voice = await import('@react-native-voice/voice');
        await voice.default.stop();
        await voice.default.destroy();
        voice.default.removeAllListeners();
        console.log('Speech recognition stopped and cleaned up');
      } catch (error) {
        console.log('Speech stop error:', error);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
    
    // Update state and show review modal
    setIsRecording(false);
    setIsProcessing(false);
    
    // If no transcript was captured, provide a helpful placeholder
    if (!transcript.trim()) {
      setTranscript(''); // Start with empty text for better UX
    }
    
    console.log('Final transcript before modal:', transcript);
    
    setShowReview(true);
  }, [recording, scaleAnim, transcript, speechTimeout]);

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
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 32,
    },
    headerLeft: {
      flex: 1,
    },
    settingsButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.border,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.8,
      shadowRadius: 8,
      elevation: 6,
    },
    settingsButtonText: {
      fontSize: 20,
      color: theme.text,
    },
    title: {
      color: theme.text,
      fontSize: 32,
      fontWeight: '800',
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 18,
      lineHeight: 24,
      maxWidth: 280,
    },
    mainContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    timerContainer: {
      alignItems: 'center',
      marginBottom: 60,
    },
    timer: {
      color: theme.text,
      fontSize: 64,
      fontWeight: '200',
      fontVariant: ['tabular-nums'],
      letterSpacing: 2,
      marginBottom: 16,
    },
    recordingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.error,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 30,
      shadowColor: theme.error,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 6,
    },
    recordingDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.textInverse,
      marginRight: 12,
    },
    recordingText: {
      color: theme.textInverse,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 1.5,
    },
    micContainer: {
      alignItems: 'center',
      marginBottom: 40,
      position: 'relative',
    },
    micButtonWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    micButton: {
      padding: 16,
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
      shadowColor: theme.border,
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
    },
    micIcon: {
      color: theme.textInverse,
      fontSize: 72,
      fontWeight: 'bold',
    },
    hint: {
      color: theme.textSecondary,
      fontSize: 18,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 300,
      fontWeight: '500',
    },
    bottomNav: {
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 40,
    },
    notesButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surface,
      paddingHorizontal: 32,
      paddingVertical: 20,
      borderRadius: 30,
      shadowColor: theme.border,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.8,
      shadowRadius: 8,
      elevation: 6,
    },
    notesButtonIcon: {
      fontSize: 22,
      marginRight: 12,
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
      shadowColor: theme.border,
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 16,
      elevation: 12,
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
      shadowColor: theme.border,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: -4,
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
      borderRadius: 20,
      minWidth: 140,
      alignItems: 'center',
    },
    save: { 
      backgroundColor: theme.primary,
      shadowColor: theme.border,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.8,
      shadowRadius: 8,
      elevation: 6,
    },
    cancel: { 
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.border,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.8,
      shadowRadius: 8,
      elevation: 6,
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
                    backgroundColor: isProcessing ? theme.warning : theme.primary,
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
          <Text style={styles.notesButtonText}>View Notes</Text>
        </Pressable>
      </View>

      {/* Review Modal */}
      <Modal transparent visible={showReview} animationType="slide" onRequestClose={() => setShowReview(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Review Your Note</Text>
            <TextInput
              style={styles.input}
              multiline
              value={transcript}
              placeholder="Your notes will appear here..."
              placeholderTextColor={theme.textSecondary}
              onChangeText={setTranscript}
              autoFocus={!transcript || transcript === 'Tap to add your notes...'}
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.actionBtn, styles.cancel]} onPress={() => { 
                setShowReview(false); 
                setTranscript(''); 
                setElapsedMs(0); // Reset timer when discarding
              }}>
                <Text style={[styles.actionText, { color: theme.text }]}>Discard</Text>
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
                <Text style={styles.actionText}>Save Note</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}



