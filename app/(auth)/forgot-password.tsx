import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { supabase } from "@/services/supabase";
import { ArrowLeft, Mail, CheckCircle2, KeyRound } from "lucide-react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successSent, setSuccessSent] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const redirectUrl =
        Platform.OS === "web" && typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (resetError) throw resetError;

      setSuccessSent(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.message?.includes("rate limit")) {
        setError("Too many password reset requests. Please wait a few minutes before trying again.");
      } else if (err.message?.includes("network")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.message || "Failed to send password reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back to Login Button */}
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back to Sign In</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.logoContainer}>
            <View style={[styles.sacredIconCircle, { backgroundColor: colors.primaryLight }]}>
              <KeyRound size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter your email address and we will send you a link to reset your account password.
            </Text>
          </View>

          {/* Card Form */}
          <View
            style={[
              styles.formContainer,
              { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 },
            ]}
          >
            {successSent ? (
              <View style={styles.successBox}>
                <View style={styles.successIconCircle}>
                  <CheckCircle2 size={40} color="#16a34a" />
                </View>
                <Text style={[styles.successTitle, { color: colors.text }]}>Check Your Email</Text>
                <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
                  We have sent a secure password reset link to:
                </Text>
                <Text style={[styles.successEmail, { color: colors.primary }]}>{email.trim()}</Text>
                <Text style={[styles.successHint, { color: colors.textSecondary }]}>
                  Please click the link in your email to choose a new password. Remember to check your Spam / Junk folder if you do not see it in a few minutes.
                </Text>

                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: colors.primary, marginTop: 20 }]}
                  onPress={() => router.replace("/")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginButtonText}>Return to Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.resendButton, { borderColor: colors.border }]}
                  onPress={() => setSuccessSent(false)}
                >
                  <Text style={[styles.resendButtonText, { color: colors.textSecondary }]}>
                    Try a different email
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 },
                    ]}
                  >
                    <Mail size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="name@example.com"
                      placeholderTextColor={colors.textSecondary}
                      value={email}
                      onChangeText={(val) => {
                        setEmail(val);
                        if (error) setError("");
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoFocus
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: colors.primary }]}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.backToLoginRow}>
                  <Text style={[styles.signupText, { color: colors.textSecondary }]}>Remember your password?</Text>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={[styles.signupLink, { color: colors.primary }]}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  sacredIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  backToLoginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 6,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "700",
  },
  successBox: {
    alignItems: "center",
    paddingVertical: 10,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  successDesc: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  successEmail: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  successHint: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  resendButton: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  resendButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
