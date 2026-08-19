import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView, Platform, Modal, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { useRouter } from "expo-router";
import { LogOut, Moon, Bell, Shield, HelpCircle, Globe, Check, AlertTriangle } from "lucide-react-native";
import { supabase } from "@/services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const { colors, toggleTheme, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const { locale, setLocale, languages, t } = useLanguage();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    const loadNotificationPreference = async () => {
      try {
        const savedPref = await AsyncStorage.getItem("notifications_enabled");
        if (savedPref !== null) {
          setNotificationsEnabled(savedPref === "true");
        }
      } catch (err) {
        console.error("Error loading notification setting:", err);
      }
    };
    loadNotificationPreference();
  }, []);

  const handleNotificationToggle = async (val: boolean) => {
    setNotificationsEnabled(val);
    try {
      await AsyncStorage.setItem("notifications_enabled", val ? "true" : "false");
    } catch (err) {
      console.error("Error saving notification setting:", err);
    }
  };

  const executeSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/(auth)");
    } catch (error) {
      console.error("Error during sign out:", error);
      router.replace("/(auth)");
    } finally {
      setSigningOut(false);
      setShowSignOutConfirm(false);
    }
  };

  const handleSignOutPress = () => {
    if (Platform.OS === "web") {
      setShowSignOutConfirm(true);
      return;
    }

    Alert.alert(
      t("signOut") || "Sign Out",
      t("signOutConfirm") || "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: t("signOut") || "Sign Out",
          style: "destructive",
          onPress: executeSignOut,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.email ? user.email.charAt(0).toUpperCase() : "G"}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.user_metadata?.display_name || (user?.email ? user.email.split("@")[0] : "Guest User")}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.email || "Signed in as Guest"}
          </Text>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Moon size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : "#f4f3f4"}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Daily Wisdom Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: "#767577", true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t("language") || "Language"}</Text>
          
          <View style={[styles.languageContainer, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Globe size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Select Language</Text>
            </View>
            <View style={styles.languageButtons}>
              {Object.values(languages).map((lang: any) => {
                const isSelected = locale === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langBadge,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.cardBackground,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setLocale(lang.code)}
                  >
                    <Text
                      style={[
                        styles.langBadgeText,
                        { color: isSelected ? "#fff" : colors.text },
                      ]}
                    >
                      {lang.nativeName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <HelpCircle size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Help & FAQ</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Shield size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: colors.danger }]}
          onPress={handleSignOutPress}
          disabled={signingOut}
          activeOpacity={0.8}
        >
          {signingOut ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <LogOut size={20} color="#fff" />
              <Text style={styles.signOutText}>{t("signOut") || "Sign Out"}</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Bhagavad Gita Wellness v1.0.0
        </Text>
      </ScrollView>

      {/* Cross-Platform Confirmation Modal for Web & Native */}
      <Modal
        visible={showSignOutConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSignOutConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.modalIconCircle}>
              <AlertTriangle size={28} color="#dc2626" />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("signOut") || "Sign Out"}
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              {t("signOutConfirm") || "Are you sure you want to sign out of your account?"}
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => setShowSignOutConfirm(false)}
                disabled={signingOut}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: colors.danger }]}
                onPress={executeSignOut}
                disabled={signingOut}
              >
                {signingOut ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>{t("signOut") || "Sign Out"}</Text>
                )}
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  languageContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  languageButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  langBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  langBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  signOutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBox: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalConfirmBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});