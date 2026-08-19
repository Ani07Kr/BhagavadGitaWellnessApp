import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";
import { Clock, AlertTriangle, LogIn } from "lucide-react-native";
import { useRouter } from "expo-router";

export function GuestTimerBanner() {
  const { isGuest, guestExpiry, signOut } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (!isGuest || !guestExpiry) return 0;
    return Math.max(0, Math.ceil((guestExpiry - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!isGuest || !guestExpiry) {
      setSecondsRemaining(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((guestExpiry - Date.now()) / 1000));
      setSecondsRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isGuest, guestExpiry]);

  if (!isGuest || secondsRemaining <= 0) {
    return null;
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const isUrgent = secondsRemaining <= 45;

  const handleEndGuestSession = async () => {
    await signOut();
    router.replace("/(auth)");
  };

  return (
    <View
      style={[
        styles.bannerContainer,
        {
          backgroundColor: isUrgent ? "#fef2f2" : "#fffbeb",
          borderColor: isUrgent ? "#ef4444" : "#f59e0b",
        },
      ]}
    >
      <View style={styles.leftContent}>
        {isUrgent ? (
          <AlertTriangle size={15} color="#dc2626" />
        ) : (
          <Clock size={15} color="#d97706" />
        )}
        <View style={styles.textColumn}>
          <Text
            style={[
              styles.bannerTitle,
              { color: isUrgent ? "#b91c1c" : "#92400e" },
            ]}
          >
            Guest Session: <Text style={styles.timerHighlight}>{formattedTime}</Text> remaining
          </Text>
          <Text style={[styles.bannerSub, { color: isUrgent ? "#dc2626" : "#b45309" }]}>
            No data is saved in guest mode
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          {
            backgroundColor: isUrgent ? "#dc2626" : colors.primary,
          },
        ]}
        onPress={handleEndGuestSession}
        activeOpacity={0.8}
      >
        <LogIn size={12} color="#fff" />
        <Text style={styles.actionBtnText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    zIndex: 9999,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  textColumn: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  timerHighlight: {
    fontWeight: "900",
    fontSize: 12.5,
    letterSpacing: 0.5,
  },
  bannerSub: {
    fontSize: 9.5,
    fontWeight: "500",
    marginTop: 0.5,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 6,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 10.5,
    fontWeight: "700",
  },
});
