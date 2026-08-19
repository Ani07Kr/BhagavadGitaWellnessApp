import { useState, useEffect } from "react";
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
import { Lock, CheckCircle2, Eye, EyeOff, ShieldCheck, AlertCircle, KeyRound, ArrowLeft } from "lucide-react-native";

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successUpdated, setSuccessUpdated] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    // Check if there is an error in URL hash (e.g. expired link)
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const fullQuery = hash.startsWith("#") ? hash.substring(1) : search.startsWith("?") ? search.substring(1) : "";
      const params = new URLSearchParams(fullQuery);
      
      const urlError = params.get("error");
      const urlErrorCode = params.get("error_code");
      const urlErrorDesc = params.get("error_description");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (urlError || urlErrorCode || urlErrorDesc) {
        if (urlErrorCode === "otp_expired" || urlErrorDesc?.includes("expired")) {
          setError("Your password reset link has expired. Please request a new link below.");
        } else if (urlErrorDesc) {
          setError(decodeURIComponent(urlErrorDesc.replace(/\+/g, " ")));
        } else {
          setError("Invalid password reset link. Please request a new one.");
        }
        return;
      }

      // If tokens are in URL hash, establish the session directly
      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ error: sessionErr }) => {
          if (sessionErr) {
            console.error("Session set error:", sessionErr);
          } else {
            setIsSessionReady(true);
          }
        });
      }
    }

    // Check if user already has an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsSessionReady(true);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsSessionReady(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Updates password for the authenticated recovery session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setSuccessUpdated(true);
    } catch (err: any) {
      console.error("Password update error:", err);
      if (err.message?.includes("Auth session missing") || err.message?.includes("recovery") || err.message?.includes("expired")) {
        setError("Your password reset session has expired. Please request a new reset link.");
      } else {
        setError(err.message || "Failed to update password. Please try again.");
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
          {/* Header */}
          <View style={styles.logoContainer}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <ShieldCheck size={34} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Set New Password</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Choose a strong, secure password for your Bhagavad Gita Wellness account.
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.formContainer,
              { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 },
            ]}
          >
            {successUpdated ? (
              <View style={styles.successBox}>
                <View style={styles.successIconCircle}>
                  <CheckCircle2 size={42} color="#16a34a" />
                </View>
                <Text style={[styles.successTitle, { color: colors.text }]}>Password Reset Complete!</Text>
                <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
                  Your password has been successfully updated. You can now sign in with your new credentials.
                </Text>

                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: colors.primary, marginTop: 24 }]}
                  onPress={() => router.replace("/")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loginButtonText}>Sign In Now</Text>
                </TouchableOpacity>
              </View>
            ) : error && error.includes("expired") ? (
              <View style={styles.expiredBox}>
                <View style={styles.errorIconCircle}>
                  <AlertCircle size={38} color="#dc2626" />
                </View>
                <Text style={[styles.errorBoxTitle, { color: colors.text }]}>Link Expired or Invalid</Text>
                <Text style={[styles.errorBoxDesc, { color: colors.textSecondary }]}>
                  {error}
                </Text>

                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: colors.primary, marginTop: 16, width: "100%" }]}
                  onPress={() => router.replace("/forgot-password")}
                  activeOpacity={0.8}
                >
                  <KeyRound size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.loginButtonText}>Request New Reset Link</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelLink}
                  onPress={() => router.replace("/")}
                >
                  <ArrowLeft size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                  <Text style={[styles.cancelLinkText, { color: colors.textSecondary }]}>
                    Back to Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

                {/* New Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 },
                    ]}
                  >
                    <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Minimum 6 characters"
                      placeholderTextColor={colors.textSecondary}
                      value={newPassword}
                      onChangeText={(val) => {
                        setNewPassword(val);
                        if (error) setError("");
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color={colors.textSecondary} />
                      ) : (
                        <Eye size={18} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 },
                    ]}
                  >
                    <Lock size={18} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Re-enter your new password"
                      placeholderTextColor={colors.textSecondary}
                      value={confirmPassword}
                      onChangeText={(val) => {
                        setConfirmPassword(val);
                        if (error) setError("");
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: colors.primary }]}
                  onPress={handleUpdatePassword}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Update Password</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelLink}
                  onPress={() => router.replace("/")}
                >
                  <Text style={[styles.cancelLinkText, { color: colors.textSecondary }]}>
                    Cancel and Return to Sign In
                  </Text>
                </TouchableOpacity>
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  iconCircle: {
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
  eyeBtn: {
    padding: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  loginButton: {
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelLink: {
    flexDirection: "row",
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  cancelLinkText: {
    fontSize: 13,
    fontWeight: "600",
  },
  successBox: {
    alignItems: "center",
    paddingVertical: 12,
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
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  expiredBox: {
    alignItems: "center",
    paddingVertical: 8,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  errorBoxTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  errorBoxDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
    paddingHorizontal: 6,
  },
});
