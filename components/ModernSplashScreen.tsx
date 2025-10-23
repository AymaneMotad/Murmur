import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

const { width, height } = Dimensions.get('window');

interface ModernSplashScreenProps {
  onAnimationComplete?: () => void;
}

export default function ModernSplashScreen({ onAnimationComplete }: ModernSplashScreenProps) {
  const { theme, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations with staggered timing
    Animated.sequence([
      // First: Logo appears with scale
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Then: Content fades in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // Start pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
        // Start wave animation
        Animated.loop(
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ),
      ]),
    ]).start();

    // Call completion callback after animation
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backgroundGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.background,
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    logoContainer: {
      marginBottom: 40,
      alignItems: 'center',
    },
    logo: {
      width: 140,
      height: 140,
      borderRadius: 35,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.4,
      shadowRadius: 30,
      elevation: 20,
    },
    logoText: {
      fontSize: 64,
      fontWeight: '900',
      color: theme.textInverse,
      letterSpacing: -2,
    },
    waveContainer: {
      position: 'relative',
      height: 120,
      marginBottom: 50,
      justifyContent: 'center',
    },
    waveBar: {
      position: 'absolute',
      width: 4,
      borderRadius: 2,
      bottom: 0,
    },
    appName: {
      fontSize: 48,
      fontWeight: '900',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 16,
      letterSpacing: -1.5,
    },
    tagline: {
      fontSize: 22,
      fontWeight: '600',
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 40,
      lineHeight: 30,
      maxWidth: 320,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.primary,
      marginHorizontal: 6,
    },
    featureText: {
      fontSize: 16,
      fontWeight: '400',
      color: theme.textTertiary,
      textAlign: 'center',
      marginTop: 20,
      lineHeight: 22,
    },
  });

  const waveBars = Array.from({ length: 9 }, (_, i) => {
    const barWidth = 4;
    const barSpacing = 6;
    const startX = (width - (9 * barWidth + 8 * barSpacing)) / 2;
    const x = startX + i * (barWidth + barSpacing);
    
    // Different heights for wave effect
    const heights = [30, 50, 70, 90, 110, 90, 70, 50, 30];
    const barHeight = heights[i];
    
    return (
      <Animated.View
        key={i}
        style={[
          styles.waveBar,
          {
            left: x,
            height: barHeight,
            backgroundColor: theme.primary,
            transform: [
              {
                scaleY: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.2, 1.3, 0.2],
                }),
              },
            ],
          },
        ]}
      />
    );
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo with pulse animation */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: logoAnim,
              transform: [
                {
                  scale: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
                {
                  scale: pulseAnim,
                },
              ],
            },
          ]}
        >
          <View style={styles.logo}>
            <Text style={styles.logoText}>M</Text>
          </View>
        </Animated.View>
        
        {/* Audio wave visualization */}
        <View style={styles.waveContainer}>
          {waveBars}
        </View>
        
        {/* App name */}
        <Text style={styles.appName}>Murmur</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>Your thoughts, amplified ✨</Text>
        
        {/* Feature highlight */}
        <Text style={styles.featureText}>
          Voice notes • Smart transcription • Beautiful organization
        </Text>
        
        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <Animated.View 
            style={[
              styles.loadingDot,
              {
                opacity: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              },
            ]}
          />
          <Animated.View 
            style={[
              styles.loadingDot,
              {
                opacity: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.2, 1, 0.2],
                }),
              },
            ]}
          />
          <Animated.View 
            style={[
              styles.loadingDot,
              {
                opacity: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.1, 1, 0.1],
                }),
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
}
