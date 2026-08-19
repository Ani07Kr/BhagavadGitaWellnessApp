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
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check } from "lucide-react-native";

interface VedicDatePickerProps {
  visible: boolean;
  value: string; // "YYYY-MM-DD"
  onSelect: (dateStr: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  "January (पौष/माघ)", "February (माघ/फाल्गुन)", "March (फाल्गुन/चैत्र)",
  "April (चैत्र/वैशाख)", "May (वैशाख/ज्येष्ठ)", "June (ज्येष्ठ/आषाढ़)",
  "July (आषाढ़/श्रावण)", "August (श्रावण/भाद्रपद)", "September (भाद्रपद/आश्विन)",
  "October (आश्विन/कार्तिक)", "November (कार्तिक/मार्गशीर्ष)", "December (मार्गशीर्ष/पौष)"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function VedicDatePicker({
  visible,
  value,
  onSelect,
  onClose,
}: VedicDatePickerProps) {
  const { colors } = useTheme();

  const [initialYear, initialMonth, initialDay] = (value || "1998-05-15").split("-").map(Number);
  const [selectedYear, setSelectedYear] = useState(initialYear || 1998);
  const [selectedMonth, setSelectedMonth] = useState((initialMonth || 5) - 1); // 0-indexed
  const [selectedDay, setSelectedDay] = useState(initialDay || 15);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);

  // Calculate days in current month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  const yearsList = [];
  const currentYear = new Date().getFullYear();
  for (let y = 1940; y <= currentYear + 1; y++) {
    yearsList.push(y);
  }

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleConfirm = () => {
    const mm = String(selectedMonth + 1).padStart(2, "0");
    const dd = String(selectedDay).padStart(2, "0");
    onSelect(`${selectedYear}-${mm}-${dd}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <CalendarIcon size={18} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Select Birth Date (जन्म तिथि)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Month & Year Bar */}
          <View style={styles.monthYearBar}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <ChevronLeft size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.yearSelectorBtn, { backgroundColor: colors.primaryLight }]}
              onPress={() => setYearPickerOpen(!yearPickerOpen)}
            >
              <Text style={[styles.monthYearText, { color: colors.primary }]}>
                {MONTH_NAMES[selectedMonth].split(" ")[0]} {selectedYear}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <ChevronRight size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {yearPickerOpen ? (
            /* Year Grid Selector */
            <View style={styles.yearGridContainer}>
              <Text style={[styles.yearGridTitle, { color: colors.textSecondary }]}>Select Birth Year</Text>
              <ScrollView style={styles.yearScroll} contentContainerStyle={styles.yearGrid}>
                {yearsList.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[
                      styles.yearChip,
                      {
                        backgroundColor: y === selectedYear ? colors.primary : colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSelectedYear(y);
                      setYearPickerOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.yearChipText,
                        { color: y === selectedYear ? "#fff" : colors.text, fontWeight: y === selectedYear ? "700" : "500" },
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            /* Calendar Month Grid */
            <View style={styles.calendarContainer}>
              {/* Day headers */}
              <View style={styles.weekRow}>
                {DAYS_OF_WEEK.map((d, i) => (
                  <Text key={i} style={[styles.weekDayText, { color: colors.textSecondary }]}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Days grid */}
              <View style={styles.daysGrid}>
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.dayBox} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = day === selectedDay;
                  return (
                    <TouchableOpacity
                      key={`day-${day}`}
                      style={[
                        styles.dayBox,
                        isSelected && {
                          backgroundColor: colors.primary,
                          borderRadius: 20,
                        },
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color: isSelected ? "#fff" : colors.text,
                            fontWeight: isSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Confirm Button */}
          <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
            <Check size={18} color="#fff" />
            <Text style={styles.confirmBtnText}>Set Birth Date</Text>
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
    maxWidth: 360,
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
  monthYearBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 14,
  },
  navBtn: {
    padding: 8,
  },
  yearSelectorBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  calendarContainer: {
    marginBottom: 16,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekDayText: {
    width: 38,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayBox: {
    width: "14.28%",
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 14,
  },
  yearGridContainer: {
    height: 240,
    marginBottom: 16,
  },
  yearGridTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  yearScroll: {
    flex: 1,
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    paddingBottom: 12,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 64,
    alignItems: "center",
  },
  yearChipText: {
    fontSize: 13,
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
