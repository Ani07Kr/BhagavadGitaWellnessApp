import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useTheme } from "@/context/theme";
import { Sparkles, Clock, Globe } from "lucide-react-native";

// Vedic Muhurta Names (30 Muhurtas in a solar day, ~48 mins each)
const MUHURTA_NAMES = [
  "Rudra (रुद्र)", "Ahi (अहि)", "Mitra (मित्र)", "Pitri (पितृ)", "Vasu (वसु)",
  "Varaha (वराह)", "Viswedeva (विश्वेदेव)", "Vidhi (विधि)", "Sutamukhi (सुतमुखी)", "Puruhuta (पुरुहूत)",
  "Vahini (वाहिनी)", "Naktancara (नक्तंचर)", "Varuna (वरुण)", "Aryaman (अर्यमन्)", "Bhaga (भग)",
  "Girisa (गिरीश)", "Ajapada (अजपाद)", "Ahirbudhnya (अहिर्बुध्न्य)", "Pusana (पूषन)", "Asvini (अश्विनी)",
  "Yama (यम)", "Agni (अग्नि)", "Vidhatr (विधातृ)", "Kandu (कण्डू)", "Aditi (अदिति)",
  "Jiva (जीव)", "Visnu (विष्णु)", "Dyumani (द्युमणि)", "Brahma (ब्रह्म)", "Samudra (समुद्र)"
];

export default function VedicCosmicClock() {
  const { colors } = useTheme();
  const [now, setNow] = useState(new Date());
  
  // Animation for live flipping second
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());

      // Subtle flip / pulse on each second
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // 🪐 Vedic Epoch Computations (Surya Siddhanta & Traditional Panchang)
  // Kali Yuga started in 3102 BCE (at midnight, 18 Feb 3102 BCE)
  const kaliYugaElapsedYear = 3102 + year + (month > 2 || (month === 2 && date >= 21) ? 1 : 0);
  const kaliCentury = Math.ceil(kaliYugaElapsedYear / 100);
  const vikramSamvat = year + 57 + (month > 2 ? 1 : 0);
  const shakaSamvat = year - 78;

  // ⏳ Vedic Time Units (Ghati, Pala, Vipala)
  // 1 Solar Day (24 hrs) = 60 Ghatis
  // 1 Ghati = 24 mins = 60 Palas (1 Pala = 24 secs)
  // 1 Pala = 60 Vipalas (1 Vipala = 0.4 secs)
  const secondsSinceMidnight = hours * 3600 + minutes * 60 + seconds;
  const totalGhatis = (secondsSinceMidnight / 86400) * 60;
  const ghati = Math.floor(totalGhatis);
  const pala = Math.floor((totalGhatis - ghati) * 60);
  const vipala = Math.floor((((totalGhatis - ghati) * 60) - pala) * 60);

  // 🕉️ Muhurta (1 Muhurta = 48 mins; 30 Muhurtas per day)
  const muhurtaIndex = Math.floor((secondsSinceMidnight / 86400) * 30);
  const currentMuhurta = MUHURTA_NAMES[muhurtaIndex % 30];

  // Helper formatting for 2-digits
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const formattedHours = pad(hours % 12 || 12);
  const formattedMinutes = pad(minutes);
  const formattedSeconds = pad(seconds);
  const ampm = hours >= 12 ? "PM" : "AM";

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      {/* Top Banner: Cosmic Vedic Epoch */}
      <View style={styles.headerRow}>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
          <Globe size={13} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            VEDIC KAAL CHAKRA (काल चक्र)
          </Text>
        </View>
        <View style={styles.liveIndicator}>
          <View style={[styles.liveDot, { backgroundColor: "#10b981" }]} />
          <Text style={[styles.liveText, { color: colors.textSecondary }]}>LIVE</Text>
        </View>
      </View>

      {/* Main Epoch Display: Kali Yuga */}
      <View style={styles.yugaContainer}>
        <Text style={[styles.yugaTitle, { color: colors.primary }]}>
          कलि युग • Kali Yuga (1st Charana)
        </Text>
        <Text style={[styles.yugaSubtitle, { color: colors.text }]}>
          Year <Text style={[styles.highlightText, { color: colors.primary }]}>{kaliYugaElapsedYear.toLocaleString()}</Text> of 432,000 • <Text style={[styles.highlightText, { color: colors.primary }]}>{kaliCentury}th</Text> Century (५२वीं शताब्दी)
        </Text>
      </View>

      {/* Vedic Era Samvats */}
      <View style={[styles.samvatRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
        <View style={styles.samvatItem}>
          <Text style={[styles.samvatLabel, { color: colors.textSecondary }]}>VIKRAM SAMVAT</Text>
          <Text style={[styles.samvatValue, { color: colors.text }]}>२०८३ ({vikramSamvat})</Text>
        </View>
        <View style={[styles.samvatDivider, { backgroundColor: colors.border }]} />
        <View style={styles.samvatItem}>
          <Text style={[styles.samvatLabel, { color: colors.textSecondary }]}>SHAKA SAMVAT</Text>
          <Text style={[styles.samvatValue, { color: colors.text }]}>१९४८ ({shakaSamvat})</Text>
        </View>
        <View style={[styles.samvatDivider, { backgroundColor: colors.border }]} />
        <View style={styles.samvatItem}>
          <Text style={[styles.samvatLabel, { color: colors.textSecondary }]}>MANVANTARA</Text>
          <Text style={[styles.samvatValue, { color: colors.text }]}>7th (वैवस्वत)</Text>
        </View>
      </View>

      {/* Live Flipping Cosmic Clocks Grid */}
      <View style={styles.clockSection}>
        {/* Gregorian Standard Time with Animated Seconds */}
        <View style={styles.clockBlock}>
          <View style={styles.clockHeader}>
            <Clock size={14} color={colors.secondary} />
            <Text style={[styles.clockLabel, { color: colors.textSecondary }]}>SOLAR TIME (सूर्य काल)</Text>
          </View>
          
          <View style={styles.digitRow}>
            <View style={[styles.digitBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.digitText, { color: colors.text }]}>{formattedHours}</Text>
            </View>
            <Text style={[styles.colon, { color: colors.primary }]}>:</Text>
            <View style={[styles.digitBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.digitText, { color: colors.text }]}>{formattedMinutes}</Text>
            </View>
            <Text style={[styles.colon, { color: colors.primary }]}>:</Text>
            <Animated.View style={[
              styles.digitBox, 
              styles.secondBox,
              { 
                backgroundColor: colors.primaryLight, 
                borderColor: colors.primary,
                transform: [{ scale: pulseAnim }]
              }
            ]}>
              <Text style={[styles.digitText, { color: colors.primary, fontWeight: "bold" }]}>
                {formattedSeconds}
              </Text>
            </Animated.View>
            <Text style={[styles.ampmText, { color: colors.textSecondary }]}>{ampm}</Text>
          </View>
        </View>

        {/* Vedic Subdivisions: Ghati : Pala : Vipala */}
        <View style={[styles.vedicTimeBlock, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.vedicTimeHeader}>
            <Sparkles size={13} color={colors.primary} />
            <Text style={[styles.vedicTimeLabel, { color: colors.primary }]}>VEDIC UNITS (घटी : पल : विपल)</Text>
          </View>
          
          <View style={styles.vedicTimeValues}>
            <Text style={[styles.vedicNumber, { color: colors.text }]}>
              {pad(ghati)} <Text style={styles.vedicUnit}>घटी</Text> : {pad(pala)} <Text style={styles.vedicUnit}>पल</Text> : {pad(vipala)} <Text style={styles.vedicUnit}>विपल</Text>
            </Text>
          </View>

          <Text style={[styles.muhurtaText, { color: colors.textSecondary }]}>
            Active Muhurta: <Text style={{ color: colors.text, fontWeight: "600" }}>{currentMuhurta}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  yugaContainer: {
    marginBottom: 14,
  },
  yugaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  yugaSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  highlightText: {
    fontWeight: "bold",
  },
  samvatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 14,
  },
  samvatItem: {
    flex: 1,
    alignItems: "center",
  },
  samvatLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  samvatValue: {
    fontSize: 13,
    fontWeight: "bold",
  },
  samvatDivider: {
    width: 1,
    height: 24,
  },
  clockSection: {
    gap: 12,
  },
  clockBlock: {
    alignItems: "center",
  },
  clockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 8,
  },
  clockLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  digitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  digitBox: {
    width: 44,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  secondBox: {
    borderWidth: 1.5,
  },
  digitText: {
    fontSize: 20,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  colon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  ampmText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  vedicTimeBlock: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  vedicTimeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  vedicTimeLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  vedicTimeValues: {
    marginVertical: 2,
  },
  vedicNumber: {
    fontSize: 16,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
  },
  vedicUnit: {
    fontSize: 11,
    fontWeight: "500",
  },
  muhurtaText: {
    fontSize: 11,
    marginTop: 4,
  },
});
