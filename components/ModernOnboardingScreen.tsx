import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Animated, Dimensions, NativeModules, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { getUserPreferences, saveUserPreferences, UserPreferences } from '@/lib/storage';
import { useTheme } from '@/hooks/use-theme';

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

export default function ModernOnboardingScreen() {
  const { theme, isDark } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [deviceLanguage, setDeviceLanguage] = useState<string>('en-US');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [currentStep, setCurrentStep] = useState(0);
  const [stepAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Get device language using a fallback approach
    const getDeviceLanguage = () => {
      try {
        let locale = 'en-US';
        
        if (Platform.OS === 'ios') {
          const { SettingsManager } = NativeModules;
          if (SettingsManager && SettingsManager.settings) {
            locale = SettingsManager.settings.AppleLocale || SettingsManager.settings.AppleLanguages?.[0] || 'en-US';
          }
        } else if (Platform.OS === 'android') {
          const { I18nManager } = NativeModules;
          if (I18nManager && I18nManager.localeIdentifier) {
            locale = I18nManager.localeIdentifier;
          }
        } else if (typeof navigator !== 'undefined') {
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
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleNext = () => {
    if (currentStep < 2) {
      // Animate out current step
      Animated.parallel([
        Animated.timing(stepAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        // Reset and animate in next step
        stepAnim.setValue(50);
        Animated.parallel([
          Animated.timing(stepAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Animate out current step
      Animated.parallel([
        Animated.timing(stepAnim, {
          toValue: 50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        // Reset and animate in previous step
        stepAnim.setValue(-50);
        Animated.parallel([
          Animated.timing(stepAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
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
      router.replace('/');
    }
  };

  const getLanguageDisplayName = (code: string) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    return lang ? `${lang.flag} ${lang.name}` : code;
  };

  const features = [
    {
      icon: '🎙️',
      title: 'Voice-First Design',
      description: 'Capture thoughts instantly with your voice. Perfect for meetings, brainstorming, or quick ideas.',
    },
    {
      icon: '✨',
      title: 'Smart Transcription',
      description: 'AI-powered speech recognition that understands context and delivers accurate transcriptions.',
    },
    {
      icon: '🗂️',
      title: 'Beautiful Organization',
      description: 'Visualize your thoughts with mind maps, graphs, and intelligent categorization.',
    },
    {
      icon: '🚀',
      title: 'Lightning Fast',
      description: 'From voice to organized notes in seconds. No more fumbling with keyboards.',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: Math.max(24, width * 0.06), // Responsive padding
      paddingTop: Math.max(60, height * 0.08), // Responsive top padding
      paddingBottom: Math.max(20, height * 0.03), // Responsive bottom padding
    },
    stepContent: {
      flex: 1,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    logoText: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.textInverse,
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 12,
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: 18,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 26,
      marginBottom: 40,
    },
    featuresContainer: {
      marginBottom: 20,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    featureIcon: {
      fontSize: 32,
      marginRight: 16,
      marginTop: 4,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    featureDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    deviceLanguageContainer: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    deviceLanguageLabel: {
      color: theme.text,
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '600',
    },
    languageList: {
      flex: 1,
      marginBottom: 24,
    },
    languageListContent: {
      paddingBottom: 20,
    },
    finalFeaturesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 40,
      paddingHorizontal: 20,
    },
    finalFeatureItem: {
      alignItems: 'center',
      flex: 1,
    },
    finalFeatureIcon: {
      fontSize: 32,
      marginBottom: 12,
    },
    finalFeatureText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
    },
    navigationContainer: {
      paddingHorizontal: 24,
      paddingBottom: 40,
      paddingTop: 30,
      backgroundColor: theme.background,
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
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    },
    backButton: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: theme.border,
      flex: 1,
      alignItems: 'center',
    },
    backButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    nextButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      flex: 2,
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    nextButtonText: {
      color: theme.textInverse,
      fontSize: 16,
      fontWeight: '700',
    },
    continueButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      flex: 2,
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    continueButtonText: {
      color: theme.textInverse,
      fontSize: 16,
      fontWeight: '700',
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.border,
      marginHorizontal: 4,
    },
    stepDotActive: {
      backgroundColor: theme.primary,
    },
  });

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>M</Text>
              </View>
              <Text style={styles.title}>Welcome to Murmur</Text>
              <Text style={styles.subtitle}>
                Transform your voice into organized, beautiful notes ✨
              </Text>
            </View>

            {/* Features showcase */}
            <View style={styles.featuresContainer}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Choose Your Language</Text>
              <Text style={styles.subtitle}>
                Select your preferred language for voice recognition
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
              showsVerticalScrollIndicator={true}
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
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>M</Text>
              </View>
              <Text style={styles.title}>You're All Set!</Text>
              <Text style={styles.subtitle}>
                Ready to start capturing your thoughts with {getLanguageDisplayName(selectedLanguage)}
              </Text>
            </View>

            {/* Final features highlight */}
            <View style={styles.finalFeaturesContainer}>
              <View style={styles.finalFeatureItem}>
                <Text style={styles.finalFeatureIcon}>🎙️</Text>
                <Text style={styles.finalFeatureText}>Tap to record</Text>
              </View>
              <View style={styles.finalFeatureItem}>
                <Text style={styles.finalFeatureIcon}>✨</Text>
                <Text style={styles.finalFeatureText}>AI transcription</Text>
              </View>
              <View style={styles.finalFeatureItem}>
                <Text style={styles.finalFeatureIcon}>🗂️</Text>
                <Text style={styles.finalFeatureText}>Smart organization</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: stepAnim }],
          },
        ]}
      >
        {renderStep()}
      </Animated.View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          {[0, 1, 2].map((step) => (
            <View
              key={step}
              style={[
                styles.stepDot,
                currentStep === step && styles.stepDotActive,
              ]}
            />
          ))}
        </View>

        {/* Navigation buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <Pressable
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
          )}
          
          <Pressable
            style={[
              styles.nextButton,
              currentStep === 2 && styles.continueButton,
            ]}
            onPress={currentStep === 2 ? handleContinue : handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 2 ? 'Start Capturing Thoughts' : 'Next →'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
