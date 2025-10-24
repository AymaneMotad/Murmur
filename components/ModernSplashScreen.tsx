import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { useResponsiveLayout, useResponsiveComponentSizes, useResponsiveSpacing, useResponsiveTypography, useDeviceType } from '@/hooks/use-responsive';

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
  
  // Get responsive hooks
  const device = useDeviceType();
  const layout = useResponsiveLayout();
  const componentSizes = useResponsiveComponentSizes();
  const spacing = useResponsiveSpacing();
  const typography = useResponsiveTypography();

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

  const createResponsiveStyles = () => StyleSheet.create({
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
      paddingHorizontal: device.isTablet ? 60 : 40,
      width: '100%',
    },
    logoContainer: {
      marginBottom: device.isTablet ? 80 : 60,
      alignItems: 'center',
    },
    logo: {
      width: device.isTablet ? 220 : 180,
      height: device.isTablet ? 220 : 180,
      borderRadius: device.isTablet ? 55 : 45,
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
      fontSize: device.isTablet ? 100 : 80,
      fontWeight: '900',
      color: theme.textInverse,
      letterSpacing: -3,
    },
    appName: {
      fontSize: device.isTablet ? 72 : 56,
      fontWeight: '900',
      color: theme.text,
      textAlign: 'center',
      marginBottom: device.isTablet ? 28 : 20,
      letterSpacing: -2,
    },
    tagline: {
      fontSize: device.isTablet ? 32 : 24,
      fontWeight: '500',
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: device.isTablet ? 80 : 60,
      lineHeight: device.isTablet ? 40 : 32,
      maxWidth: device.isTablet ? 400 : 300,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingDot: {
      width: device.isTablet ? 20 : 16,
      height: device.isTablet ? 20 : 16,
      borderRadius: device.isTablet ? 10 : 8,
      backgroundColor: theme.primary,
      marginHorizontal: device.isTablet ? 12 : 8,
    },
  });

  const styles = createResponsiveStyles();


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
