import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { useRouter } from "expo-router";
import { LogOut, Moon, Bell, Shield, HelpCircle } from "lucide-react-native";
import { supabase } from "@/services/supabase";

export default function ProfileScreen() {
  const { colors, toggleTheme, isDark } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              signOut();
              router.replace("/");
            } catch (error) {
              console.error("Error signing out:", error);
            }
          },
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
            {user?.email ? user.email.split("@")[0] : "Guest User"}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {user?.email || "Anonymous User"}
          </Text>
        </View>

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
              trackColor={{ false: "#cbd5e1", true: colors.primaryLight }}
              thumbColor={isDark ? colors.primary : "#f1f5f9"}
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#cbd5e1", true: colors.primaryLight }}
              thumbColor={notificationsEnabled ? colors.primary : "#f1f5f9"}
            />
          </View>
        </View>

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

        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: colors.danger }]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Bhagavad Gita Wellness v1.0.0
        </Text>
      </ScrollView>
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
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  name: {
    fontSize: 20,
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
    fontWeight: "600",
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
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
});