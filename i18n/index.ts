import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './translations/en';
import hi from './translations/hi';
import sa from './translations/sa';

// Define available languages
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  sa: { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
};

// Create i18n instance
const i18n = new I18n({
  en,
  hi,
  sa,
});

// Set the locale once at the beginning of your app
i18n.locale = Localization.locale.split('-')[0];
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Helper function to get the current locale
export const getCurrentLocale = async () => {
  try {
    const savedLocale = await AsyncStorage.getItem('user-locale');
    if (savedLocale) {
      return savedLocale;
    }
  } catch (error) {
    console.error('Error getting locale from storage:', error);
  }
  return i18n.locale;
};

// Helper function to set the locale
export const setLocale = async (locale: string) => {
  try {
    i18n.locale = locale;
    await AsyncStorage.setItem('user-locale', locale);
  } catch (error) {
    console.error('Error saving locale to storage:', error);
  }
};

// Initialize locale from storage
export const initLocale = async () => {
  const savedLocale = await getCurrentLocale();
  i18n.locale = savedLocale;
  return savedLocale;
};

export default i18n;