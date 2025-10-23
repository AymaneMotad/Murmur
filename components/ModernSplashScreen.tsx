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
      paddingHorizontal: 40,
      width: '100%',
    },
    logoContainer: {
      marginBottom: 60,
      alignItems: 'center',
    },
    logo: {
      width: 180,
      height: 180,
      borderRadius: 45,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.5,
      shadowRadius: 40,
      elevation: 25,
    },
    logoText: {
      fontSize: 80,
      fontWeight: '900',
      color: theme.textInverse,
      letterSpacing: -3,
    },
    appName: {
      fontSize: 56,
      fontWeight: '900',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 20,
      letterSpacing: -2,
    },
    tagline: {
      fontSize: 24,
      fontWeight: '500',
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 60,
      lineHeight: 32,
      maxWidth: 300,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.primary,
      marginHorizontal: 8,
    },
  });


  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Main logo with enhanced animation */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: logoAnim,
              transform: [
                {
                  scale: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
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
        
        {/* App name with better typography */}
        <Text style={styles.appName}>Murmur</Text>
        
        {/* Clean tagline */}
        <Text style={styles.tagline}>Your thoughts, amplified</Text>
        
        {/* Simple loading indicator */}
        <View style={styles.loadingContainer}>
          <Animated.View 
            style={[
              styles.loadingDot,
              {
                opacity: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.4, 1, 0.4],
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
        </View>
      </Animated.View>
    </View>
  );
}
