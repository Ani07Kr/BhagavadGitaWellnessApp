import { useEffect, useState, useCallback } from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "@/context/theme";
import { AuthProvider } from "@/context/auth";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator, StyleSheet, Platform, Linking, Button } from "react-native";
import { checkTablesExist, getTableCreationInstructions, testSupabaseConnection } from "@/services/supabase";

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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
        <ActivityIndicator size="large" color="#6366f1" />
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
            color="#6366f1"
          />
          <Button 
            title="Retry Connection" 
            onPress={() => {
              setLoading(true);
              setConnectionError(null);
              checkDatabase();
            }} 
            color="#6366f1"
          />
        </View>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="questions/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="face-detection" options={{ headerShown: false }} />
          <Stack.Screen name="ecg-upload" options={{ headerShown: false }} />
          <Stack.Screen name="results" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ef4444",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 12,
  }
});