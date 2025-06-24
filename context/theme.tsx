import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeColors = {
  primary: string;
  primaryLight: string;
  secondary: string;
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  border: string;
  danger: string;
};

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
};

const lightColors: ThemeColors = {
  primary: "#6366f1",
  primaryLight: "#e0e7ff",
  secondary: "#64748b",
  background: "#f8fafc",
  cardBackground: "#ffffff",
  text: "#334155",
  textSecondary: "#64748b",
  border: "#e2e8f0",
  danger: "#ef4444",
};

const darkColors: ThemeColors = {
  primary: "#818cf8",
  primaryLight: "#4f46e5",
  secondary: "#94a3b8",
  background: "#0f172a",
  cardBackground: "#1e293b",
  text: "#f1f5f9",
  textSecondary: "#94a3b8",
  border: "#334155",
  danger: "#f87171",
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");
  const [colors, setColors] = useState<ThemeColors>(
    isDark ? darkColors : lightColors
  );

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme !== null) {
          const isDarkTheme = savedTheme === "dark";
          setIsDark(isDarkTheme);
          setColors(isDarkTheme ? darkColors : lightColors);
        } else {
          // Use system preference if no saved theme
          setIsDark(systemColorScheme === "dark");
          setColors(systemColorScheme === "dark" ? darkColors : lightColors);
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
      setColors(newIsDark ? darkColors : lightColors);
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