import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { getUserPreferences } from '@/lib/storage';
import ModernSplashScreen from '@/components/ModernSplashScreen';

export default function AppSplash() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Show splash for at least 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check onboarding status
        const preferences = await getUserPreferences();
        
        // Navigate based on onboarding status
        if (preferences.hasCompletedOnboarding) {
          router.replace('/');
        } else {
          router.replace('/onboarding');
        }
      } catch (error) {
        console.error('Error during splash screen:', error);
        // Default to onboarding if there's an error
        router.replace('/onboarding');
      }
    };

    initializeApp();
  }, []);

  return <ModernSplashScreen />;
}
