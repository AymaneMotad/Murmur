import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { getUserPreferences, saveUserPreferences, UserPreferences } from '@/lib/storage';
import { useTheme } from '@/hooks/use-theme';

// Supported languages with their display names and flags
const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸', nativeName: 'English' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧', nativeName: 'English' },
  { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽', nativeName: 'Español' },
  { code: 'fr-FR', name: 'French (France)', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'fr-CA', name: 'French (Canada)', flag: '🇨🇦', nativeName: 'Français' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'ru-RU', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳', nativeName: '中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼', nativeName: '中文' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱', nativeName: 'Nederlands' },
  { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪', nativeName: 'Svenska' },
  { code: 'no-NO', name: 'Norwegian', flag: '🇳🇴', nativeName: 'Norsk' },
  { code: 'da-DK', name: 'Danish', flag: '🇩🇰', nativeName: 'Dansk' },
  { code: 'fi-FI', name: 'Finnish', flag: '🇫🇮', nativeName: 'Suomi' },
  { code: 'pl-PL', name: 'Polish', flag: '🇵🇱', nativeName: 'Polski' },
  { code: 'tr-TR', name: 'Turkish', flag: '🇹🇷', nativeName: 'Türkçe' },
];

export default function SettingsScreen() {
  const { theme, isDark, themeMode, setThemeMode } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const loadUserLanguage = async () => {
      try {
        const preferences = await getUserPreferences();
        setSelectedLanguage(preferences.selectedLanguage);
      } catch (error) {
        console.error('Error loading user language:', error);
      }
    };
    loadUserLanguage();

    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    try {
      const preferences = await getUserPreferences();
      const updatedPreferences: UserPreferences = {
        ...preferences,
        selectedLanguage: languageCode,
      };
      await saveUserPreferences(updatedPreferences);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const handleResetOnboarding = async () => {
    try {
      const preferences = await getUserPreferences();
      const updatedPreferences: UserPreferences = {
        ...preferences,
        hasCompletedOnboarding: false,
      };
      await saveUserPreferences(updatedPreferences);
      // Navigate to splash screen to restart the flow
      router.replace('/splash');
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 32,
    },
    backButton: {
      padding: 8,
    },
    backButtonText: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
    },
    placeholder: {
      width: 60,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 16,
      marginTop: 24,
    },
    settingItem: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    settingItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    settingIcon: {
      fontSize: 20,
      marginRight: 16,
    },
    settingTextContainer: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    settingValue: {
      fontSize: 14,
      color: theme.textSecondary,
      marginRight: 8,
    },
    themeSelector: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    themeOption: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    themeOptionSelected: {
      backgroundColor: theme.primary,
    },
    themeOptionText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textSecondary,
    },
    themeOptionTextSelected: {
      color: theme.textInverse,
    },
    languageList: {
      flex: 1,
    },
    languageListContent: {
      paddingBottom: 20,
    },
    languageItem: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    languageItemSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    languageItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    languageFlag: {
      fontSize: 24,
      marginRight: 16,
    },
    languageTextContainer: {
      flex: 1,
    },
    languageName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    languageNameSelected: {
      color: theme.textInverse,
    },
    languageNativeName: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    languageNativeNameSelected: {
      color: theme.textInverse,
      opacity: 0.8,
    },
    selectedIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.textInverse,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      color: theme.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Theme Selection */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingItemContent}>
            <Text style={styles.settingIcon}>🎨</Text>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingSubtitle}>Choose your preferred theme</Text>
            </View>
          </View>
          <View style={styles.themeSelector}>
            <Pressable
              style={[
                styles.themeOption,
                themeMode === 'light' && styles.themeOptionSelected,
              ]}
              onPress={() => setThemeMode('light')}
            >
              <Text style={[
                styles.themeOptionText,
                themeMode === 'light' && styles.themeOptionTextSelected,
              ]}>
                Light
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.themeOption,
                themeMode === 'dark' && styles.themeOptionSelected,
              ]}
              onPress={() => setThemeMode('dark')}
            >
              <Text style={[
                styles.themeOptionText,
                themeMode === 'dark' && styles.themeOptionTextSelected,
              ]}>
                Dark
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.themeOption,
                themeMode === 'system' && styles.themeOptionSelected,
              ]}
              onPress={() => setThemeMode('system')}
            >
              <Text style={[
                styles.themeOptionText,
                themeMode === 'system' && styles.themeOptionTextSelected,
              ]}>
                System
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Development/Testing Options */}
        <Text style={styles.sectionTitle}>Development</Text>
        <View style={styles.settingItem}>
          <Pressable 
            style={styles.settingItemContent}
            onPress={handleResetOnboarding}
          >
            <Text style={styles.settingIcon}>🔄</Text>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Reset Onboarding</Text>
              <Text style={styles.settingSubtitle}>Show onboarding flow again</Text>
            </View>
          </Pressable>
        </View>

        {/* Language Selection */}
        <Text style={styles.sectionTitle}>Language</Text>
        <Text style={styles.subtitle}>
          Choose your preferred language for voice recognition
        </Text>

        <ScrollView 
          style={styles.languageList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.languageListContent}
        >
          {SUPPORTED_LANGUAGES.map((language) => (
            <Pressable
              key={language.code}
              style={[
                styles.languageItem,
                selectedLanguage === language.code && styles.languageItemSelected,
              ]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <View style={styles.languageItemContent}>
                <Text style={styles.languageFlag}>{language.flag}</Text>
                <View style={styles.languageTextContainer}>
                  <Text style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.languageNameSelected
                  ]}>
                    {language.name}
                  </Text>
                  <Text style={[
                    styles.languageNativeName,
                    selectedLanguage === language.code && styles.languageNativeNameSelected
                  ]}>
                    {language.nativeName}
                  </Text>
                </View>
                {selectedLanguage === language.code && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

