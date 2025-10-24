/**
 * Responsive Design Hooks
 * Provides hooks for responsive design patterns and utilities
 */

import { useState, useEffect, useMemo } from 'react';
import { Dimensions, Platform } from 'react-native';
import { 
  breakpoints, 
  deviceType, 
  responsiveDimensions, 
  spacing, 
  typography, 
  layout, 
  componentSizes, 
  shadows,
  responsiveUtils 
} from '@/constants/responsive';

// Hook for screen dimensions
export const useScreenDimensions = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

// Hook for device type detection
export const useDeviceType = () => {
  const { width, height } = useScreenDimensions();
  
  return useMemo(() => ({
    isPhone: width < breakpoints.md,
    isTablet: width >= breakpoints.md && width < breakpoints.lg,
    isLargeTablet: width >= breakpoints.lg,
    isSmallPhone: width < breakpoints.sm,
    isLandscape: width > height,
    width,
    height,
  }), [width, height]);
};

// Hook for responsive values
export const useResponsiveValue = <T>(values: {
  phone?: T;
  tablet?: T;
  largeTablet?: T;
}): T => {
  const device = useDeviceType();
  
  return useMemo(() => {
    if (device.isLargeTablet && values.largeTablet) {
      return values.largeTablet;
    }
    if (device.isTablet && values.tablet) {
      return values.tablet;
    }
    return values.phone as T;
  }, [device.isLargeTablet, device.isTablet, values]);
};

// Hook for responsive spacing
export const useResponsiveSpacing = () => {
  const device = useDeviceType();
  
  return useMemo(() => ({
    xs: device.isTablet ? 6 : 4,
    sm: device.isTablet ? 12 : 8,
    md: device.isTablet ? 20 : 16,
    lg: device.isTablet ? 28 : 24,
    xl: device.isTablet ? 36 : 32,
    xxl: device.isTablet ? 56 : 48,
    xxxl: device.isTablet ? 72 : 64,
  }), [device.isTablet]);
};

// Hook for responsive typography
export const useResponsiveTypography = () => {
  const device = useDeviceType();
  
  return useMemo(() => ({
    h1: {
      fontSize: device.isTablet ? 36 : 28,
      fontWeight: '700' as const,
      lineHeight: device.isTablet ? 44 : 36,
      letterSpacing: 0.5,
    },
    h2: {
      fontSize: device.isTablet ? 32 : 24,
      fontWeight: '600' as const,
      lineHeight: device.isTablet ? 40 : 32,
      letterSpacing: 0.3,
    },
    h3: {
      fontSize: device.isTablet ? 28 : 20,
      fontWeight: '600' as const,
      lineHeight: device.isTablet ? 36 : 28,
      letterSpacing: 0.2,
    },
    bodyLarge: {
      fontSize: device.isTablet ? 22 : 18,
      fontWeight: '400' as const,
      lineHeight: device.isTablet ? 32 : 26,
      letterSpacing: 0.2,
    },
    body: {
      fontSize: device.isTablet ? 20 : 16,
      fontWeight: '400' as const,
      lineHeight: device.isTablet ? 30 : 24,
      letterSpacing: 0.2,
    },
    bodySmall: {
      fontSize: device.isTablet ? 18 : 14,
      fontWeight: '400' as const,
      lineHeight: device.isTablet ? 26 : 20,
      letterSpacing: 0.1,
    },
    caption: {
      fontSize: device.isTablet ? 16 : 12,
      fontWeight: '500' as const,
      lineHeight: device.isTablet ? 22 : 16,
      letterSpacing: 0.5,
    },
    button: {
      fontSize: device.isTablet ? 20 : 16,
      fontWeight: '600' as const,
      lineHeight: device.isTablet ? 28 : 20,
      letterSpacing: 0.3,
    },
    label: {
      fontSize: device.isTablet ? 18 : 14,
      fontWeight: '500' as const,
      lineHeight: device.isTablet ? 24 : 18,
      letterSpacing: 0.2,
    },
  }), [device.isTablet]);
};

// Hook for responsive layout
export const useResponsiveLayout = () => {
  const { width, height } = useScreenDimensions();
  const device = useDeviceType();
  
  return useMemo(() => ({
    containerWidth: device.isTablet ? Math.min(device.width * 0.8, 800) : device.width,
    contentWidth: device.isTablet ? Math.min(device.width * 0.9, 900) : device.width,
    containerPadding: device.isTablet ? 32 : 16,
    sectionPadding: device.isTablet ? 48 : 24,
    cardPadding: device.isTablet ? 32 : 16,
    columns: device.isTablet ? 2 : 1,
    columnGap: device.isTablet ? 24 : 16,
    rowGap: device.isTablet ? 24 : 16,
  }), [width, device.isTablet]);
};

// Hook for responsive component sizes
export const useResponsiveComponentSizes = () => {
  const device = useDeviceType();
  
  return useMemo(() => ({
    buttonHeight: device.isTablet ? 64 : 48,
    buttonHeightSmall: device.isTablet ? 48 : 36,
    buttonHeightLarge: device.isTablet ? 72 : 56,
    buttonPadding: device.isTablet ? 24 : 16,
    cardBorderRadius: device.isTablet ? 28 : 20,
    cardPadding: device.isTablet ? 32 : 16,
    cardMinHeight: device.isTablet ? 140 : 100,
    iconSize: device.isTablet ? 32 : 24,
    iconSizeSmall: device.isTablet ? 24 : 16,
    iconSizeLarge: device.isTablet ? 40 : 32,
    inputHeight: device.isTablet ? 64 : 48,
    inputPadding: device.isTablet ? 24 : 16,
    inputBorderRadius: device.isTablet ? 20 : 12,
    tabBarHeight: device.isTablet ? 88 : 60,
    headerHeight: device.isTablet ? 108 : 80,
    modalMaxWidth: device.isTablet ? 700 : device.width,
    modalPadding: device.isTablet ? 48 : 24,
  }), [device.isTablet]);
};

// Hook for responsive shadows
export const useResponsiveShadows = () => {
  const device = useDeviceType();
  
  return useMemo(() => ({
    small: {
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: device.isTablet ? 0.15 : 0.1,
      shadowRadius: device.isTablet ? 6 : 4,
      elevation: device.isTablet ? 3 : 2,
    },
    medium: {
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: device.isTablet ? 0.2 : 0.15,
      shadowRadius: device.isTablet ? 12 : 8,
      elevation: device.isTablet ? 6 : 4,
    },
    large: {
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: device.isTablet ? 0.25 : 0.2,
      shadowRadius: device.isTablet ? 20 : 16,
      elevation: device.isTablet ? 10 : 8,
    },
    xlarge: {
      shadowOffset: { width: 12, height: 12 },
      shadowOpacity: device.isTablet ? 0.3 : 0.25,
      shadowRadius: device.isTablet ? 28 : 24,
      elevation: device.isTablet ? 14 : 12,
    },
  }), [device.isTablet]);
};

// Hook for orientation changes
export const useOrientation = () => {
  const { width, height } = useScreenDimensions();
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    width > height ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    setOrientation(width > height ? 'landscape' : 'portrait');
  }, [width, height]);

  return orientation;
};

// Hook for safe area dimensions
export const useSafeAreaDimensions = () => {
  return useMemo(() => ({
    top: Platform.OS === 'ios' ? 44 : 24,
    bottom: Platform.OS === 'ios' ? 34 : 0,
    left: 0,
    right: 0,
  }), []);
};

// Hook for responsive grid
export const useResponsiveGrid = () => {
  const device = useDeviceType();
  const layout = useResponsiveLayout();
  
  return useMemo(() => ({
    getColumnWidth: (columns: number = 1) => {
      const totalGap = (columns - 1) * layout.columnGap;
      return (layout.containerWidth - totalGap) / columns;
    },
    getColumns: () => {
      if (device.isLargeTablet) return 3;
      if (device.isTablet) return 2;
      return 1;
    },
    getGap: () => layout.columnGap,
  }), [device.isLargeTablet, device.isTablet, layout]);
};

// Hook for responsive breakpoint detection
export const useBreakpoint = () => {
  const { width } = useScreenDimensions();
  
  return useMemo(() => ({
    isXs: width < breakpoints.sm,
    isSm: width >= breakpoints.sm && width < breakpoints.md,
    isMd: width >= breakpoints.md && width < breakpoints.lg,
    isLg: width >= breakpoints.lg && width < breakpoints.xl,
    isXl: width >= breakpoints.xl,
    current: (() => {
      if (width >= breakpoints.xl) return 'xl';
      if (width >= breakpoints.lg) return 'lg';
      if (width >= breakpoints.md) return 'md';
      if (width >= breakpoints.sm) return 'sm';
      return 'xs';
    })(),
  }), [width]);
};

// Hook for responsive utilities
export const useResponsiveUtils = () => {
  const device = useDeviceType();
  const { width, height } = useScreenDimensions();
  
  return useMemo(() => ({
    getSpacing: (multiplier: number = 1) => {
      const baseSpacing = device.isTablet ? 8 : 6;
      return baseSpacing * multiplier;
    },
    getFontSize: (baseSize: number) => {
      const scale = device.isTablet ? 1.2 : 1;
      return baseSize * scale;
    },
    getWidthPercentage: (percentage: number) => {
      return (width * percentage) / 100;
    },
    getHeightPercentage: (percentage: number) => {
      return (height * percentage) / 100;
    },
    isLandscape: () => width > height,
  }), [device.isTablet, width, height]);
};

export default {
  useScreenDimensions,
  useDeviceType,
  useResponsiveValue,
  useResponsiveSpacing,
  useResponsiveTypography,
  useResponsiveLayout,
  useResponsiveComponentSizes,
  useResponsiveShadows,
  useOrientation,
  useSafeAreaDimensions,
  useResponsiveGrid,
  useBreakpoint,
  useResponsiveUtils,
};
