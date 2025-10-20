import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Call completion callback after animation
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const waveBars = Array.from({ length: 9 }, (_, i) => {
    const barWidth = 8;
    const barSpacing = 12;
    const startX = (width - (9 * barWidth + 8 * barSpacing)) / 2;
    const x = startX + i * (barWidth + barSpacing);
    
    // Different heights for wave effect
    const heights = [40, 60, 80, 100, 120, 100, 80, 60, 40];
    const barHeight = heights[i];
    
    return (
      <Animated.View
        key={i}
        style={[
          styles.waveBar,
          {
            left: x,
            height: barHeight,
            transform: [
              {
                scaleY: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1.2, 0.5],
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
      {/* Full screen gradient background */}
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
        {/* Large audio wave visualization */}
        <View style={styles.waveContainer}>
          {waveBars}
        </View>
        
        {/* Large app name */}
        <Text style={styles.appName}>Murmur</Text>
        
        {/* Large tagline */}
        <Text style={styles.tagline}>Your thoughts, amplified</Text>
        
        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <Animated.View 
            style={[
              styles.loadingDot,
              {
                opacity: waveAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.6, 1, 0.6],
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f1419',
    opacity: 0.9,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveContainer: {
    position: 'relative',
    height: 200,
    marginBottom: 60,
    justifyContent: 'center',
  },
  waveBar: {
    position: 'absolute',
    width: 8,
    backgroundColor: '#0066ff',
    borderRadius: 4,
    bottom: 0,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    color: '#9BA1A6',
    textAlign: 'center',
    marginBottom: 80,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066ff',
    marginHorizontal: 4,
  },
});
