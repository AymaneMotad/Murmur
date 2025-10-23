/**
 * Enhanced theme system with comprehensive light and dark mode support
 * Inspired by modern design systems with clean, elegant aesthetics
 */

import { Platform } from 'react-native';

// Primary brand colors
const primaryBlue = '#0066ff';
const primaryBlueLight = '#4d94ff';
const primaryBlueDark = '#0052cc';

// Semantic colors
const successGreen = '#00c851';
const warningOrange = '#ff8800';
const errorRed = '#ff4444';
const infoBlue = '#33b5e5';

export const Colors = {
  light: {
    // Primary colors
    primary: primaryBlue,
    primaryLight: primaryBlueLight,
    primaryDark: primaryBlueDark,
    
    // Background colors
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#f1f3f4',
    surface: '#ffffff',
    surfaceElevated: '#ffffff',
    
    // Text colors
    text: '#1a1a1a',
    textSecondary: '#6c757d',
    textTertiary: '#9ca3af',
    textInverse: '#ffffff',
    
    // Border colors
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    borderDark: '#d1d5db',
    
    // Interactive colors
    tint: primaryBlue,
    tabIconDefault: '#6b7280',
    tabIconSelected: primaryBlue,
    icon: '#6b7280',
    iconSecondary: '#9ca3af',
    
    // Status colors
    success: successGreen,
    warning: warningOrange,
    error: errorRed,
    info: infoBlue,
    
    // Card colors
    cardBackground: '#ffffff',
    cardBorder: '#e5e7eb',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    
    // Button colors
    buttonPrimary: primaryBlue,
    buttonPrimaryText: '#ffffff',
    buttonSecondary: '#f8f9fa',
    buttonSecondaryText: '#1a1a1a',
    buttonDanger: errorRed,
    buttonDangerText: '#ffffff',
    
    // Input colors
    inputBackground: '#ffffff',
    inputBorder: '#d1d5db',
    inputBorderFocused: primaryBlue,
    inputPlaceholder: '#9ca3af',
    
    // Navigation
    navBackground: '#ffffff',
    navBorder: '#e5e7eb',
    navActive: primaryBlue,
    navInactive: '#6b7280',
  },
  dark: {
    // Primary colors
    primary: primaryBlue,
    primaryLight: primaryBlueLight,
    primaryDark: primaryBlueDark,
    
    // Background colors
    background: '#0f1419',
    backgroundSecondary: '#1a1d2e',
    backgroundTertiary: '#252a3a',
    surface: '#1a1d2e',
    surfaceElevated: '#252a3a',
    
    // Text colors
    text: '#ffffff',
    textSecondary: '#9ba1a6',
    textTertiary: '#6b7280',
    textInverse: '#0f1419',
    
    // Border colors
    border: '#374151',
    borderLight: '#4b5563',
    borderDark: '#1f2937',
    
    // Interactive colors
    tint: primaryBlue,
    tabIconDefault: '#9ba1a6',
    tabIconSelected: primaryBlue,
    icon: '#9ba1a6',
    iconSecondary: '#6b7280',
    
    // Status colors
    success: successGreen,
    warning: warningOrange,
    error: errorRed,
    info: infoBlue,
    
    // Card colors
    cardBackground: '#1a1d2e',
    cardBorder: '#374151',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    
    // Button colors
    buttonPrimary: primaryBlue,
    buttonPrimaryText: '#ffffff',
    buttonSecondary: '#374151',
    buttonSecondaryText: '#ffffff',
    buttonDanger: errorRed,
    buttonDangerText: '#ffffff',
    
    // Input colors
    inputBackground: '#1a1d2e',
    inputBorder: '#374151',
    inputBorderFocused: primaryBlue,
    inputPlaceholder: '#6b7280',
    
    // Navigation
    navBackground: '#0f1419',
    navBorder: '#374151',
    navActive: primaryBlue,
    navInactive: '#9ba1a6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
