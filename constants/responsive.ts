/**
 * Responsive Design System
 * Provides scalable breakpoints, dimensions, and utilities for all device sizes
 */

import { Dimensions, Platform } from 'react-native';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device type detection
export const isTablet = screenWidth >= 768;
export const isLargeTablet = screenWidth >= 1024;
export const isSmallPhone = screenWidth < 375;
export const isPhone = screenWidth >= 375 && screenWidth < 768;
export const isLandscape = screenWidth > screenHeight;

// Responsive breakpoints
export const breakpoints = {
  xs: 0,      // Extra small devices (phones)
  sm: 375,    // Small devices (phones)
  md: 768,    // Medium devices (tablets)
  lg: 1024,   // Large devices (large tablets)
  xl: 1200,   // Extra large devices (desktops)
} as const;

// Device categories
export const deviceType = {
  isPhone: screenWidth < breakpoints.md,
  isTablet: screenWidth >= breakpoints.md && screenWidth < breakpoints.lg,
  isLargeTablet: screenWidth >= breakpoints.lg,
  isSmallPhone: screenWidth < breakpoints.sm,
  isLandscape: screenWidth > screenHeight,
} as const;

// Responsive dimensions
export const responsiveDimensions = {
  screenWidth,
  screenHeight,
  safeAreaTop: Platform.OS === 'ios' ? 44 : 24,
  safeAreaBottom: Platform.OS === 'ios' ? 34 : 0,
  statusBarHeight: Platform.OS === 'ios' ? 44 : 24,
  headerHeight: Platform.OS === 'ios' ? 88 : 64,
  tabBarHeight: Platform.OS === 'ios' ? 83 : 60,
} as const;

// Responsive spacing scale (based on 8px grid)
export const spacing = {
  xs: 4,      // 0.5 units
  sm: 8,      // 1 unit
  md: 16,     // 2 units
  lg: 24,     // 3 units
  xl: 32,     // 4 units
  xxl: 48,    // 6 units
  xxxl: 64,   // 8 units
} as const;

// Responsive font sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
  hero: 40,
} as const;

// Responsive typography scale
export const typography = {
  // Headers
  h1: {
    fontSize: deviceType.isTablet ? 32 : 28,
    fontWeight: '700' as const,
    lineHeight: deviceType.isTablet ? 40 : 36,
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: deviceType.isTablet ? 28 : 24,
    fontWeight: '600' as const,
    lineHeight: deviceType.isTablet ? 36 : 32,
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: deviceType.isTablet ? 24 : 20,
    fontWeight: '600' as const,
    lineHeight: deviceType.isTablet ? 32 : 28,
    letterSpacing: 0.2,
  },
  h4: {
    fontSize: deviceType.isTablet ? 20 : 18,
    fontWeight: '600' as const,
    lineHeight: deviceType.isTablet ? 28 : 24,
    letterSpacing: 0.1,
  },
  
  // Body text
  bodyLarge: {
    fontSize: deviceType.isTablet ? 20 : 18,
    fontWeight: '400' as const,
    lineHeight: deviceType.isTablet ? 30 : 26,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: deviceType.isTablet ? 18 : 16,
    fontWeight: '400' as const,
    lineHeight: deviceType.isTablet ? 28 : 24,
    letterSpacing: 0.2,
  },
  bodySmall: {
    fontSize: deviceType.isTablet ? 16 : 14,
    fontWeight: '400' as const,
    lineHeight: deviceType.isTablet ? 24 : 20,
    letterSpacing: 0.1,
  },
  
  // UI text
  caption: {
    fontSize: deviceType.isTablet ? 14 : 12,
    fontWeight: '500' as const,
    lineHeight: deviceType.isTablet ? 20 : 16,
    letterSpacing: 0.5,
  },
  button: {
    fontSize: deviceType.isTablet ? 18 : 16,
    fontWeight: '600' as const,
    lineHeight: deviceType.isTablet ? 24 : 20,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: deviceType.isTablet ? 16 : 14,
    fontWeight: '500' as const,
    lineHeight: deviceType.isTablet ? 22 : 18,
    letterSpacing: 0.2,
  },
} as const;

// Responsive layout utilities
export const layout = {
  // Container widths
  containerWidth: deviceType.isTablet ? Math.min(screenWidth * 0.8, 800) : screenWidth,
  contentWidth: deviceType.isTablet ? Math.min(screenWidth * 0.9, 900) : screenWidth,
  
  // Padding
  containerPadding: deviceType.isTablet ? spacing.xl : spacing.md,
  sectionPadding: deviceType.isTablet ? spacing.xxl : spacing.lg,
  cardPadding: deviceType.isTablet ? spacing.xl : spacing.md,
  
  // Margins
  sectionMargin: deviceType.isTablet ? spacing.xxl : spacing.lg,
  cardMargin: deviceType.isTablet ? spacing.lg : spacing.md,
  
  // Grid system
  columns: deviceType.isTablet ? 2 : 1,
  columnGap: deviceType.isTablet ? spacing.lg : spacing.md,
  rowGap: deviceType.isTablet ? spacing.lg : spacing.md,
} as const;

// Responsive component sizes
export const componentSizes = {
  // Buttons
  buttonHeight: deviceType.isTablet ? 56 : 48,
  buttonHeightSmall: deviceType.isTablet ? 40 : 36,
  buttonHeightLarge: deviceType.isTablet ? 64 : 56,
  buttonPadding: deviceType.isTablet ? spacing.lg : spacing.md,
  
  // Cards
  cardBorderRadius: deviceType.isTablet ? 24 : 20,
  cardPadding: deviceType.isTablet ? spacing.xl : spacing.md,
  cardMinHeight: deviceType.isTablet ? 120 : 100,
  
  // Icons
  iconSize: deviceType.isTablet ? 28 : 24,
  iconSizeSmall: deviceType.isTablet ? 20 : 16,
  iconSizeLarge: deviceType.isTablet ? 36 : 32,
  
  // Inputs
  inputHeight: deviceType.isTablet ? 56 : 48,
  inputPadding: deviceType.isTablet ? spacing.lg : spacing.md,
  inputBorderRadius: deviceType.isTablet ? 16 : 12,
  
  // Navigation
  tabBarHeight: deviceType.isTablet ? 80 : 60,
  headerHeight: deviceType.isTablet ? 100 : 80,
  
  // Modal
  modalMaxWidth: deviceType.isTablet ? 600 : screenWidth,
  modalPadding: deviceType.isTablet ? spacing.xxl : spacing.lg,
} as const;

// Responsive shadow system
export const shadows = {
  small: {
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xlarge: {
    shadowOffset: { width: 12, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Responsive utility functions
export const responsiveUtils = {
  // Get responsive value based on screen size
  getResponsiveValue: <T>(values: {
    phone?: T;
    tablet?: T;
    largeTablet?: T;
  }): T => {
    if (deviceType.isLargeTablet && values.largeTablet) {
      return values.largeTablet;
    }
    if (deviceType.isTablet && values.tablet) {
      return values.tablet;
    }
    return values.phone as T;
  },
  
  // Get responsive spacing
  getSpacing: (multiplier: number = 1) => {
    const baseSpacing = deviceType.isTablet ? 8 : 6;
    return baseSpacing * multiplier;
  },
  
  // Get responsive font size
  getFontSize: (baseSize: number) => {
    const scale = deviceType.isTablet ? 1.2 : 1;
    return baseSize * scale;
  },
  
  // Get responsive width percentage
  getWidthPercentage: (percentage: number) => {
    return (screenWidth * percentage) / 100;
  },
  
  // Get responsive height percentage
  getHeightPercentage: (percentage: number) => {
    return (screenHeight * percentage) / 100;
  },
  
  // Check if device is in landscape
  isLandscape: () => screenWidth > screenHeight,
  
  // Get safe area dimensions
  getSafeAreaDimensions: () => ({
    top: responsiveDimensions.safeAreaTop,
    bottom: responsiveDimensions.safeAreaBottom,
    left: 0,
    right: 0,
  }),
} as const;

// Responsive grid system
export const grid = {
  // Calculate column width
  getColumnWidth: (columns: number = 1) => {
    const totalGap = (columns - 1) * layout.columnGap;
    return (layout.containerWidth - totalGap) / columns;
  },
  
  // Calculate responsive grid columns
  getColumns: () => {
    if (deviceType.isLargeTablet) return 3;
    if (deviceType.isTablet) return 2;
    return 1;
  },
  
  // Get responsive gap
  getGap: () => layout.columnGap,
} as const;

// Export all responsive utilities
export default {
  breakpoints,
  deviceType,
  responsiveDimensions,
  spacing,
  fontSize,
  typography,
  layout,
  componentSizes,
  shadows,
  responsiveUtils,
  grid,
};
