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
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/services/supabase";
import { Flame, Clock, ShieldAlert, X, AlertCircle, Sparkles } from "lucide-react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(false);
  const router = useRouter();
  const { signIn, startGuestSession, guestExpiredMessage, clearGuestExpiredMessage } = useAuth();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        signIn(data.user);
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      console.error("Login error:", err);

      if (err.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (err.message?.includes("network")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.message || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartGuestSession = async () => {
    setShowGuestModal(false);
    await startGuestSession();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <View style={[styles.sacredIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Flame size={32} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>Bhagavad Gita Wellness</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Find inner peace through ancient Vedic wisdom
            </Text>
          </View>

          {/* Guest Session Expired Alert Banner */}
          {guestExpiredMessage ? (
            <View style={styles.expiredBanner}>
              <AlertCircle size={18} color="#b45309" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.expiredBannerTitle}>Guest Session Ended</Text>
                <Text style={styles.expiredBannerText}>{guestExpiredMessage}</Text>
              </View>
              <TouchableOpacity onPress={clearGuestExpiredMessage} style={{ padding: 4 }}>
                <X size={16} color="#b45309" />
              </TouchableOpacity>
            </View>
          ) : null}

          <View
            style={[
              styles.formContainer,
              { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 },
            ]}
          >
            {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderWidth: 1 },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, borderWidth: 1 },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.forgotPasswordRow}>
              <TouchableOpacity
                onPress={() => router.push("/forgot-password")}
                activeOpacity={0.7}
              >
                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.anonymousButton,
                { backgroundColor: colors.cardBackground, borderColor: colors.border },
              ]}
              onPress={() => setShowGuestModal(true)}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Clock size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.anonymousButtonText, { color: colors.text }]}>
                Continue as Guest (3 Min Limit)
              </Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: colors.textSecondary }]}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/sign-up")}>
                <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Guest Mode Warning Pop-up Modal */}
      <Modal
        visible={showGuestModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGuestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.guestIconCircle, { backgroundColor: colors.primaryLight }]}>
                <Clock size={28} color={colors.primary} />
              </View>
              <TouchableOpacity
                onPress={() => setShowGuestModal(false)}
                style={styles.closeBtn}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Guest Mode Access
            </Text>
            <Text style={[styles.modalSubTitle, { color: colors.primary }]}>
              ⏱️ 3-Minute Timed Session
            </Text>

            <View style={styles.rulesContainer}>
              <View style={styles.ruleItem}>
                <Clock size={18} color="#f59e0b" style={{ marginTop: 2 }} />
                <Text style={[styles.ruleText, { color: colors.text }]}>
                  <Text style={{ fontWeight: "bold" }}>3-Minute Limit:</Text> You will be allowed to freely explore all features of the app for 3 minutes.
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <ShieldAlert size={18} color="#dc2626" style={{ marginTop: 2 }} />
                <Text style={[styles.ruleText, { color: colors.text }]}>
                  <Text style={{ fontWeight: "bold" }}>No Data Saved:</Text> Assessments, Janam Kundli charts, and emotional scores will <Text style={{ color: "#dc2626", fontWeight: "bold" }}>NOT</Text> be saved for guest logins.
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <Sparkles size={18} color="#16a34a" style={{ marginTop: 2 }} />
                <Text style={[styles.ruleText, { color: colors.text }]}>
                  <Text style={{ fontWeight: "bold" }}>Auto-Logout:</Text> Once the 3 minutes expire, you will be automatically returned to the sign-in page.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.startGuestBtn, { backgroundColor: colors.primary }]}
              onPress={handleStartGuestSession}
              activeOpacity={0.8}
            >
              <Text style={styles.startGuestBtnText}>Start 3-Minute Guest Session</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelGuestBtn}
              onPress={() => setShowGuestModal(false)}
            >
              <Text style={[styles.cancelGuestBtnText, { color: colors.textSecondary }]}>
                Cancel (Sign In with Account)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
  },
  sacredIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  tagline: {
    fontSize: 14,
    textAlign: "center",
  },
  expiredBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#f59e0b",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  expiredBannerTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 2,
  },
  expiredBannerText: {
    fontSize: 12,
    color: "#b45309",
    lineHeight: 17,
  },
  formContainer: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  forgotPasswordRow: {
    alignItems: "flex-end",
    marginTop: -8,
    marginBottom: 12,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
  },
  loginButton: {
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  anonymousButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  anonymousButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
  },
  errorText: {
    marginBottom: 14,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  guestIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    padding: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  modalSubTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 2,
  },
  rulesContainer: {
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  ruleText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  startGuestBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  startGuestBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelGuestBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  cancelGuestBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});