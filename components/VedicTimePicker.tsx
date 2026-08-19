import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "@/context/theme";
import { Clock, X, Check, Sun, Moon } from "lucide-react-native";

interface VedicTimePickerProps {
  visible: boolean;
  value: string; // "HH:MM" in 24-hr format
  onSelect: (timeStr: string) => void;
  onClose: () => void;
}

export default function VedicTimePicker({
  visible,
  value,
  onSelect,
  onClose,
}: VedicTimePickerProps) {
  const { colors } = useTheme();

  const [initialHours, initialMins] = (value || "07:30").split(":").map(Number);
  const isInitialPm = (initialHours || 7) >= 12;
  const initial12Hour = (initialHours || 7) % 12 || 12;

  const [selectedHour, setSelectedHour] = useState(initial12Hour);
  const [selectedMinute, setSelectedMinute] = useState(initialMins || 30);
  const [isPm, setIsPm] = useState(isInitialPm);
  const [mode, setMode] = useState<"hour" | "minute">("hour");

  const hoursList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const handleConfirm = () => {
    let hr24 = selectedHour;
    if (isPm && hr24 < 12) hr24 += 12;
    if (!isPm && hr24 === 12) hr24 = 0;

    const formattedHr = String(hr24).padStart(2, "0");
    const formattedMin = String(selectedMinute).padStart(2, "0");
    onSelect(`${formattedHr}:${formattedMin}`);
    onClose();
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Clock size={18} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Birth Time (जन्म समय)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Time Display Header */}
          <View style={[styles.timeDisplayCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.timeNumbersRow}>
              <TouchableOpacity
                style={[styles.timeUnitBox, mode === "hour" && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                onPress={() => setMode("hour")}
              >
                <Text style={[styles.timeUnitText, { color: mode === "hour" ? colors.primary : colors.text }]}>
                  {pad(selectedHour)}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.colon, { color: colors.primary }]}>:</Text>

              <TouchableOpacity
                style={[styles.timeUnitBox, mode === "minute" && { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
                onPress={() => setMode("minute")}
              >
                <Text style={[styles.timeUnitText, { color: mode === "minute" ? colors.primary : colors.text }]}>
                  {pad(selectedMinute)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* AM / PM Selector */}
            <View style={styles.ampmContainer}>
              <TouchableOpacity
                style={[styles.ampmBtn, !isPm && { backgroundColor: colors.primary }]}
                onPress={() => setIsPm(false)}
              >
                <Sun size={12} color={!isPm ? "#fff" : colors.textSecondary} />
                <Text style={[styles.ampmText, { color: !isPm ? "#fff" : colors.text }]}>AM (दिन)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ampmBtn, isPm && { backgroundColor: colors.primary }]}
                onPress={() => setIsPm(true)}
              >
                <Moon size={12} color={isPm ? "#fff" : colors.textSecondary} />
                <Text style={[styles.ampmText, { color: isPm ? "#fff" : colors.text }]}>PM (रात)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mode Switch Bar */}
          <View style={styles.modeBar}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === "hour" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setMode("hour")}
            >
              <Text style={[styles.modeText, { color: mode === "hour" ? colors.primary : colors.textSecondary }]}>
                Select Hour (घंटा)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, mode === "minute" && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setMode("minute")}
            >
              <Text style={[styles.modeText, { color: mode === "minute" ? colors.primary : colors.textSecondary }]}>
                Select Minute (मिनट)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selector Grid */}
          {mode === "hour" ? (
            <View style={styles.gridContainer}>
              {hoursList.map((hr) => {
                const isSelected = hr === selectedHour;
                return (
                  <TouchableOpacity
                    key={hr}
                    style={[
                      styles.circleBtn,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedHour(hr);
                      setMode("minute"); // Auto-switch to minutes for seamless UX
                    }}
                  >
                    <Text
                      style={[
                        styles.circleBtnText,
                        { color: isSelected ? "#fff" : colors.text, fontWeight: isSelected ? "700" : "500" },
                      ]}
                    >
                      {hr}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {minutesList.map((min) => {
                const isSelected = min === selectedMinute;
                return (
                  <TouchableOpacity
                    key={min}
                    style={[
                      styles.circleBtn,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setSelectedMinute(min)}
                  >
                    <Text
                      style={[
                        styles.circleBtnText,
                        { color: isSelected ? "#fff" : colors.text, fontWeight: isSelected ? "700" : "500" },
                      ]}
                    >
                      {pad(min)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
            <Check size={18} color="#fff" />
            <Text style={styles.confirmBtnText}>Set Birth Time</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  closeBtn: {
    padding: 4,
  },
  timeDisplayCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 14,
  },
  timeNumbersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeUnitBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  timeUnitText: {
    fontSize: 28,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  colon: {
    fontSize: 24,
    fontWeight: "bold",
  },
  ampmContainer: {
    gap: 6,
  },
  ampmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ampmText: {
    fontSize: 11,
    fontWeight: "700",
  },
  modeBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modeBtn: {
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  modeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 18,
  },
  circleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  circleBtnText: {
    fontSize: 16,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
