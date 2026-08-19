import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeColors = {
  primary: string;
  primaryLight: string;
  secondary: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  border: string;
  danger: string;
  gold: string;
  accent: string;
};

export type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
};

// 📜 Sacred Vedic Light Theme (Parchment, Sandalwood & Saffron)
const lightVedicColors: ThemeColors = {
  primary: "#B45309",        // Deep Saffron / Bhagwa Gold
  primaryLight: "#FEF3C7",   // Warm Kesar & Sandalwood Mist
  secondary: "#92400E",      // Antique Ochre / Terracotta
  background: "#FAF7F2",     // Ancient Sacred Parchment / Rice Paper
  cardBackground: "#FFFFFF", // Warm Ivory Leaf
  text: "#291E14",           // Roasted Palm-Leaf Ink
  textSecondary: "#785D44",  // Sandalwood Dust / Warm Teak
  border: "#EADDC9",         // Aged Palm Border
  danger: "#DC2626",         // Sacred Sindoor (Vermillion)
  gold: "#D97706",           // Temple Diya Gold
  accent: "#059669",         // Sacred Tulsi Leaf
};

// 🪔 Sacred Vedic Dark Theme (Ashram Midnight, Sandalwood Hearth & Sacred Flame)
const darkVedicColors: ThemeColors = {
  primary: "#F59E0B",        // Luminous Diya Flame Gold
  primaryLight: "#451A03",   // Warm Amber Hearth
  secondary: "#D97706",      // Burnished Temple Brass
  background: "#18120C",     // Deep Sacred Ashram Night
  cardBackground: "#251B13", // Aged Teak Wood / Sandalwood Hearth
  text: "#FEF3C7",           // Candlelit Warm Ivory
  textSecondary: "#D4B996",  // Warm Temple Ash & Sand
  border: "#3E2E20",         // Deep Teak Grain
  danger: "#EF4444",         // Sacred Flame Red
  gold: "#FBBF24",           // Radiant Gold
  accent: "#10B981",         // Radiant Tulsi Green
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: lightVedicColors,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");
  const [colors, setColors] = useState<ThemeColors>(
    isDark ? darkVedicColors : lightVedicColors
  );

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme !== null) {
          const isDarkTheme = savedTheme === "dark";
          setIsDark(isDarkTheme);
          setColors(isDarkTheme ? darkVedicColors : lightVedicColors);
        } else {
          setIsDark(systemColorScheme === "dark");
          setColors(systemColorScheme === "dark" ? darkVedicColors : lightVedicColors);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    try {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      setColors(newIsDark ? darkVedicColors : lightVedicColors);
      await AsyncStorage.setItem("theme", newIsDark ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);