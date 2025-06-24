import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/services/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      if (data.user) {
        signIn(data.user);
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      
      // More specific error handling
      if (err.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (err.message.includes("network")) {
        setError("Network error. Please check your internet connection.");
      } else if (err.message.includes("database") || err.message.includes("table")) {
        setError("Database error. Please make sure you've set up the Supabase tables correctly. See README.md for instructions.");
        Alert.alert(
          "Database Setup Required",
          "It looks like your Supabase database tables aren't set up correctly. Please follow the instructions in the README.md file.",
          [{ text: "OK" }]
        );
      } else {
        setError(err.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const { data, error: authError } = await supabase.auth.signInAnonymously();
      
      if (authError) throw authError;
      
      if (data.user) {
        signIn(data.user);
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("Anonymous login error:", err);
      
      // More specific error handling
      if (err.message.includes("network")) {
        setError("Network error. Please check your internet connection.");
      } else if (err.message.includes("database") || err.message.includes("table")) {
        setError("Database error. Please make sure you've set up the Supabase tables correctly. See README.md for instructions.");
        Alert.alert(
          "Database Setup Required",
          "It looks like your Supabase database tables aren't set up correctly. Please follow the instructions in the README.md file.",
          [{ text: "OK" }]
        );
      } else {
        setError(err.message || "Failed to sign in anonymously");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.appName}>Bhagavad Gita Wellness</Text>
            <Text style={styles.tagline}>Find peace through ancient wisdom</Text>
          </View>
          
          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.anonymousButton}
              onPress={handleAnonymousLogin}
              disabled={loading}
            >
              <Text style={styles.anonymousButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/sign-up")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.helpLink}
              onPress={() => {
                Alert.alert(
                  "Supabase Setup Required",
                  "If you're having trouble logging in, make sure you've set up your Supabase database correctly. See the README.md file for detailed instructions.",
                  [{ text: "OK" }]
                );
              }}
            >
              <Text style={styles.helpLinkText}>Having trouble connecting?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6366f1",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#334155",
  },
  loginButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  anonymousButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  anonymousButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: {
    color: "#64748b",
    fontSize: 14,
  },
  signupLink: {
    color: "#6366f1",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  errorText: {
    color: "#ef4444",
    marginBottom: 16,
    textAlign: "center",
  },
  helpLink: {
    marginTop: 16,
    alignItems: "center",
  },
  helpLinkText: {
    color: "#6366f1",
    fontSize: 14,
  },
});