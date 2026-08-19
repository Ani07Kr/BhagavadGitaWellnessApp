import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { AlertTriangle, KeyRound, ArrowLeft, RefreshCw } from "lucide-react-native";

export default function IndexHtmlHandlerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const fullQuery = hash.startsWith("#") ? hash.substring(1) : search.startsWith("?") ? search.substring(1) : "";
      
      const params = new URLSearchParams(fullQuery);
      const error = params.get("error");
      const errorCode = params.get("error_code");
      const errorDesc = params.get("error_description");
      const accessToken = params.get("access_token");
      const type = params.get("type");

      if (error || errorCode || errorDesc) {
        let msg = "The link is invalid or has expired.";
        if (errorCode === "otp_expired" || errorDesc?.includes("expired")) {
          msg = "Your password reset link has expired. For security, reset links are only valid for a limited time.";
        } else if (errorDesc) {
          msg = decodeURIComponent(errorDesc.replace(/\+/g, " "));
        }
        setAuthError(msg);
        setLoading(false);
        return;
      }

      if (accessToken || type === "recovery") {
        // Redirect to reset password screen with the hash preserved
        router.replace("/reset-password");
        return;
      }

      // Default redirect to home/login
      router.replace("/");
    } else {
      router.replace("/");
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (authError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.iconCircle}>
            <AlertTriangle size={36} color="#dc2626" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Link Expired or Invalid</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {authError}
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/forgot-password")}
            activeOpacity={0.8}
          >
            <KeyRound size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Request New Reset Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => router.replace("/")}
            activeOpacity={0.8}
          >
            <ArrowLeft size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    maxWidth: 420,
    width: "100%",
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
