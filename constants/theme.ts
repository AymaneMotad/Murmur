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
    primary: '#3498DB',
    primaryLight: '#4d94ff',
    primaryDark: '#0052cc',
    
    // Background colors - Neumorphic light theme
    background: '#E8EDF3',
    backgroundSecondary: '#F5F7FA',
    backgroundTertiary: '#E8EDF3',
    surface: '#F5F7FA',
    surfaceElevated: '#F5F7FA',
    
    // Text colors
    text: '#2C3E50',
    textSecondary: '#7B8794',
    textTertiary: '#9ca3af',
    textInverse: '#FFFFFF',
    
    // Border colors
    border: '#BDC3C7',
    borderLight: '#BDC3C7',
    borderDark: '#BDC3C7',
    
    // Interactive colors
    tint: '#3498DB',
    tabIconDefault: '#7B8794',
    tabIconSelected: '#3498DB',
    icon: '#7B8794',
    iconSecondary: '#9ca3af',
    
    // Status colors
    success: successGreen,
    warning: warningOrange,
    error: errorRed,
    info: infoBlue,
    
    // Card colors - Neumorphic
    cardBackground: '#F5F7FA',
    cardBorder: '#BDC3C7',
    cardShadow: '#BDC3C7',
    
    // Button colors - Neumorphic
    buttonPrimary: '#3498DB',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: '#F5F7FA',
    buttonSecondaryText: '#2C3E50',
    buttonDanger: errorRed,
    buttonDangerText: '#ffffff',
    
    // Input colors - Neumorphic
    inputBackground: '#E8EDF3',
    inputBorder: '#BDC3C7',
    inputBorderFocused: '#3498DB',
    inputPlaceholder: '#7B8794',
    
    // Navigation
    navBackground: '#E8EDF3',
    navBorder: '#BDC3C7',
    navActive: '#3498DB',
    navInactive: '#7B8794',
  },
  dark: {
    // Primary colors
    primary: '#3498DB',
    primaryLight: '#4d94ff',
    primaryDark: '#0052cc',
    
    // Background colors - Neumorphic dark theme
    background: '#1a1d2e',
    backgroundSecondary: '#2C3E50',
    backgroundTertiary: '#1a1d2e',
    surface: '#2C3E50',
    surfaceElevated: '#2C3E50',
    
    // Text colors
    text: '#ECF0F1',
    textSecondary: '#BDC3C7',
    textTertiary: '#6b7280',
    textInverse: '#1a1d2e',
    
    // Border colors
    border: '#0f1419',
    borderLight: '#0f1419',
    borderDark: '#0f1419',
    
    // Interactive colors
    tint: '#3498DB',
    tabIconDefault: '#BDC3C7',
    tabIconSelected: '#3498DB',
    icon: '#BDC3C7',
    iconSecondary: '#6b7280',
    
    // Status colors
    success: successGreen,
    warning: warningOrange,
    error: errorRed,
    info: infoBlue,
    
    // Card colors - Neumorphic
    cardBackground: '#2C3E50',
    cardBorder: '#0f1419',
    cardShadow: '#0f1419',
    
    // Button colors - Neumorphic
    buttonPrimary: '#3498DB',
    buttonPrimaryText: '#ffffff',
    buttonSecondary: '#2C3E50',
    buttonSecondaryText: '#ECF0F1',
    buttonDanger: errorRed,
    buttonDangerText: '#ffffff',
    
    // Input colors - Neumorphic
    inputBackground: '#1a1d2e',
    inputBorder: '#0f1419',
    inputBorderFocused: '#3498DB',
    inputPlaceholder: '#BDC3C7',
    
    // Navigation
    navBackground: '#1a1d2e',
    navBorder: '#0f1419',
    navActive: '#3498DB',
    navInactive: '#BDC3C7',
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
