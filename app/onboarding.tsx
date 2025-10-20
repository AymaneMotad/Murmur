import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated, Dimensions, NativeModules, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { getUserPreferences, saveUserPreferences, UserPreferences } from '@/lib/storage';

const { width, height } = Dimensions.get('window');

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

export default function OnboardingScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [deviceLanguage, setDeviceLanguage] = useState<string>('en-US');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Get device language using a fallback approach
    const getDeviceLanguage = () => {
      try {
        let locale = 'en-US';
        
        if (Platform.OS === 'ios') {
          // iOS: Try to get from native modules
          const { SettingsManager } = NativeModules;
          if (SettingsManager && SettingsManager.settings) {
            locale = SettingsManager.settings.AppleLocale || SettingsManager.settings.AppleLanguages?.[0] || 'en-US';
          }
        } else if (Platform.OS === 'android') {
          // Android: Try to get from native modules
          const { I18nManager } = NativeModules;
          if (I18nManager && I18nManager.localeIdentifier) {
            locale = I18nManager.localeIdentifier;
          }
        } else if (typeof navigator !== 'undefined') {
          // Web fallback
          locale = navigator.language || 'en-US';
        }
        
        const deviceLang = SUPPORTED_LANGUAGES.find(lang => 
          locale.startsWith(lang.code.split('-')[0])
        )?.code || 'en-US';
        
        return deviceLang;
      } catch (error) {
        console.log('Error detecting device language:', error);
        return 'en-US';
      }
    };
    
    const deviceLang = getDeviceLanguage();
    setDeviceLanguage(deviceLang);
    setSelectedLanguage(deviceLang);

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleContinue = async () => {
    try {
      const preferences: UserPreferences = {
        selectedLanguage,
        hasCompletedOnboarding: true,
      };
      await saveUserPreferences(preferences);
      router.replace('/');
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Still navigate to main app
      router.replace('/');
    }
  };

  const getLanguageDisplayName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Murmur</Text>
          <Text style={styles.subtitle}>
            Choose your preferred language for voice recognition
          </Text>
        </View>

        {/* Device language indicator */}
        <View style={styles.deviceLanguageContainer}>
          <Text style={styles.deviceLanguageLabel}>
            📱 Your device language: {getLanguageDisplayName(deviceLanguage)}
          </Text>
        </View>

        {/* Language selection */}
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

        {/* Continue button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
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
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ECEDEE',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9BA1A6',
    textAlign: 'center',
    lineHeight: 24,
  },
  deviceLanguageContainer: {
    backgroundColor: '#1a1d2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0066ff',
  },
  deviceLanguageLabel: {
    color: '#ECEDEE',
    fontSize: 14,
    textAlign: 'center',
  },
  languageList: {
    flex: 1,
    marginBottom: 24,
  },
  languageListContent: {
    paddingBottom: 20,
  },
  languageItem: {
    backgroundColor: '#1a1d2e',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  languageItemSelected: {
    backgroundColor: '#0066ff',
    borderColor: '#0066ff',
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
    color: '#ECEDEE',
    marginBottom: 2,
  },
  languageNameSelected: {
    color: '#FFFFFF',
  },
  languageNativeName: {
    fontSize: 14,
    color: '#9BA1A6',
  },
  languageNativeNameSelected: {
    color: '#E6F4FE',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#0066ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingTop: 16,
  },
  continueButton: {
    backgroundColor: '#0066ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0066ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
