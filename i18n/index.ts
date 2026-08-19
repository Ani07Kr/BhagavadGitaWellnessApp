import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './translations/en';
import hi from './translations/hi';
import sa from './translations/sa';

// Available languages configuration
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  sa: { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्' },
} as const;

export type SupportedLanguage = keyof typeof LANGUAGES;

// Translation dictionaries registry
const translations: Record<string, Record<string, string>> = {
  en,
  hi,
  sa,
};

class I18nManager {
  public locale: string = 'en';
  public defaultLocale: string = 'en';

  public t(key: string, options?: Record<string, any>): string {
    const currentDict = translations[this.locale] || translations[this.defaultLocale];
    const fallbackDict = translations[this.defaultLocale];

    let translation = currentDict?.[key] || fallbackDict?.[key] || key;

    // Support basic variable interpolation: %{name} or {{name}}
    if (options && typeof options === 'object') {
      Object.entries(options).forEach(([param, value]) => {
        translation = translation
          .replace(new RegExp(`%\\{${param}\\}`, 'g'), String(value))
          .replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), String(value));
      });
    }

    return translation;
  }
}

const i18n = new I18nManager();

// Helper function to get the current saved locale
export const getCurrentLocale = async (): Promise<string> => {
  try {
    const savedLocale = await AsyncStorage.getItem('user-locale');
    if (savedLocale && savedLocale in LANGUAGES) {
      return savedLocale;
    }
  } catch (error) {
    console.error('Error getting locale from storage:', error);
  }
  return i18n.locale;
};

// Helper function to set and persist the locale
export const setLocale = async (locale: string): Promise<void> => {
  try {
    if (locale in LANGUAGES) {
      i18n.locale = locale;
      await AsyncStorage.setItem('user-locale', locale);
    }
  } catch (error) {
    console.error('Error saving locale to storage:', error);
  }
};

// Initialize locale from storage on startup
export const initLocale = async (): Promise<string> => {
  const savedLocale = await getCurrentLocale();
  i18n.locale = savedLocale;
  return savedLocale;
};

export default i18n;