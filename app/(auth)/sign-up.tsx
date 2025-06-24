import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/services/supabase";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !displayName) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });
      
      if (authError) throw authError;
      
      if (data) {
        Alert.alert(
          "Account Created",
          "Your account has been created successfully. You can now sign in.",
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      
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
      } else if (err.message.includes("already registered")) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(err.message || "Failed to sign up");
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
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join Bhagavad Gita Wellness to start your journey</Text>
          </View>
          
          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Display Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>
            
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
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.helpLink}
              onPress={() => {
                Alert.alert(
                  "Supabase Setup Required",
                  "If you're having trouble signing up, make sure you've set up your Supabase database correctly. See the README.md file for detailed instructions.",
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
  headerContainer: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
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
  signupButton: {
    backgroundColor: "#6366f1",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    color: "#64748b",
    fontSize: 14,
  },
  loginLink: {
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