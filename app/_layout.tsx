import { useEffect, useState, useCallback } from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "@/context/theme";
import { AuthProvider } from "@/context/auth";
import { LanguageProvider } from "@/context/language";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator, StyleSheet, Platform, Linking, Button } from "react-native";
import { checkTablesExist, getTableCreationInstructions, testSupabaseConnection } from "@/services/supabase";

import { GuestTimerBanner } from "@/components/GuestTimerBanner";
import VedicCosmicPreloader from "@/components/VedicCosmicPreloader";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showPreloader, setShowPreloader] = useState(true);

  // Move checkDatabase outside of useEffect so it can be referenced from multiple places
  const checkDatabase = useCallback(async () => {
    try {
      // First test the connection to Supabase
      const connectionTest = await testSupabaseConnection();
      
      if (!connectionTest.success) {
        setConnectionError("Could not connect to Supabase. Please check your credentials in services/supabase.ts");
        setLoading(false);
        return;
      }
      
      // Check if tables exist
      const tablesExist = await checkTablesExist();
      
      if (!tablesExist) {
        // If tables don't exist, show instructions
        getTableCreationInstructions();
        setConnectionError("Database tables not found. Please follow the setup instructions in README.md");
      } else {
        setDbReady(true);
      }
    } catch (error) {
      console.error("Error checking database:", error);
      setConnectionError("An error occurred while connecting to the database. See README.md for setup instructions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkDatabase();
  }, [checkDatabase]);

  const openReadme = () => {
    if (Platform.OS === 'web') {
      window.open('/README.md', '_blank');
    } else {
      // On mobile, just show the instructions again
      getTableCreationInstructions();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B45309" />
        <Text style={styles.loadingText}>Initializing Bhagavad Gita Wellness...</Text>
      </View>
    );
  }

  if (connectionError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>{connectionError}</Text>
        <View style={styles.buttonContainer}>
          <Button 
            title="View Setup Instructions" 
            onPress={openReadme} 
            color="#B45309"
          />
          <Button 
            title="Retry Connection" 
            onPress={() => {
              setLoading(true);
              setConnectionError(null);
              checkDatabase();
            }} 
            color="#B45309"
          />
        </View>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <View style={{ flex: 1 }}>
            <StatusBar style="auto" />
            <GuestTimerBanner />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="questions/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="face-detection" options={{ headerShown: false }} />
              <Stack.Screen name="ecg-upload" options={{ headerShown: false }} />
              <Stack.Screen name="kundli" options={{ headerShown: false }} />
              <Stack.Screen name="panchang" options={{ headerShown: false }} />
              <Stack.Screen name="results" options={{ headerShown: false }} />
            </Stack>

            {/* 🕉️ 10-Second Sacred Vedic Preloader Screen with Falling & Jumping Mantras & Om Chants */}
            {showPreloader && (
              <VedicCosmicPreloader onComplete={() => setShowPreloader(false)} />
            )}
          </View>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF7F2",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#785D44",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF7F2",
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#DC2626",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
});