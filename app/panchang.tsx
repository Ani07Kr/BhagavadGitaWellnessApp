import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { useLanguage } from "@/context/language";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Sun,
  Moon,
  Sparkles,
  Compass,
  Clock,
  BookOpen,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Globe,
  Search,
  Flame,
} from "lucide-react-native";
import * as Speech from "expo-speech";
import {
  PanchangData,
  calculateVedicPanchang,
} from "@/services/panchangEngine";
import {
  CityLocation,
  CITIES_DATABASE,
  searchCitiesLive,
} from "@/services/citiesDatabase";
import {
  BirthDetails,
  calculateVedicKundli,
  RASHIS,
} from "@/services/jyotishEngine";
import VedicDatePicker from "@/components/VedicDatePicker";
import NorthIndianKundliChart from "@/components/NorthIndianKundliChart";
import { NaturalVoiceAssistant } from "@/services/voiceAssistant";

export default function PanchangScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { locale, setLocale } = useLanguage();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedCity, setSelectedCity] = useState<CityLocation>(CITIES_DATABASE[0]);
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "sa">(
    (locale as "en" | "hi" | "sa") || "en"
  );

  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [speakingVerse, setSpeakingVerse] = useState(false);

  // City Search State
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CityLocation[]>([]);
  const [isSearchingCity, setIsSearchingCity] = useState(false);

  // Re-calculate Panchang on Date / City / Lang change
  useEffect(() => {
    const data = calculateVedicPanchang(currentDate, selectedCity, selectedLang);
    setPanchang(data);
  }, [currentDate, selectedCity, selectedLang]);

  const changeDateByDays = (days: number) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + days);
    setCurrentDate(next);
  };

  const handleSelectDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const newDate = new Date(y, m - 1, d);
    setCurrentDate(newDate);
  };

  const handleCitySearch = async (text: string) => {
    setCityQuery(text);
    if (text.trim().length >= 2) {
      setIsSearchingCity(true);
      try {
        const results = await searchCitiesLive(text);
        setCitySuggestions(results);
      } catch (e) {
        console.warn("City search error in panchang", e);
      } finally {
        setIsSearchingCity(false);
      }
    } else {
      setCitySuggestions([]);
    }
  };

  const handleSelectCity = (city: CityLocation) => {
    setSelectedCity(city);
    setShowCitySearch(false);
    setCityQuery("");
    setCitySuggestions([]);
  };

  const handleLanguageChange = (lang: "en" | "hi" | "sa") => {
    setSelectedLang(lang);
    setLocale(lang);
  };

  const speakVerse = (text: string) => {
    if (!text.trim()) return;

    if (speakingVerse) {
      NaturalVoiceAssistant.stop();
      setSpeakingVerse(false);
    } else {
      NaturalVoiceAssistant.speak(
        text,
        selectedLang,
        "male",
        () => setSpeakingVerse(true),
        () => setSpeakingVerse(false),
        () => setSpeakingVerse(false)
      );
    }
  };

  const formatDateDisplay = (d: Date) => {
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isToday =
    currentDate.toDateString() === new Date().toDateString();

  const handleBack = () => {
    NaturalVoiceAssistant.stop();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Date Picker Modal */}
      <VedicDatePicker
        visible={datePickerVisible}
        value={currentDate.toISOString().split("T")[0]}
        onSelect={handleSelectDate}
        onClose={() => setDatePickerVisible(false)}
      />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}
          onPress={handleBack}
        >
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Daily Vedic Panchang</Text>
          <Text style={[styles.screenSubtitle, { color: colors.primary }]}>दैनिक वैदिक पञ्चाङ्गम्</Text>
        </View>

        <TouchableOpacity
          style={[styles.cityToggleBtn, { backgroundColor: colors.primaryLight }]}
          onPress={() => setShowCitySearch(!showCitySearch)}
        >
          <MapPin size={14} color={colors.primary} />
          <Text style={[styles.cityToggleText, { color: colors.primary }]} numberOfLines={1}>
            {selectedCity.name.split(" ")[0]}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Ribbon */}
      <View style={[styles.langRibbon, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Globe size={14} color={colors.secondary} />
        <Text style={[styles.langLabel, { color: colors.textSecondary }]}>Language / भाषा:</Text>
        <View style={styles.langButtonsGroup}>
          <TouchableOpacity
            style={[styles.langBtn, selectedLang === "en" && { backgroundColor: colors.primary }]}
            onPress={() => handleLanguageChange("en")}
          >
            <Text style={[styles.langBtnText, { color: selectedLang === "en" ? "#fff" : colors.text }]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, selectedLang === "hi" && { backgroundColor: colors.primary }]}
            onPress={() => handleLanguageChange("hi")}
          >
            <Text style={[styles.langBtnText, { color: selectedLang === "hi" ? "#fff" : colors.text }]}>हिन्दी</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, selectedLang === "sa" && { backgroundColor: colors.primary }]}
            onPress={() => handleLanguageChange("sa")}
          >
            <Text style={[styles.langBtnText, { color: selectedLang === "sa" ? "#fff" : colors.text }]}>संस्कृतम्</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Search Bar (Collapsible) */}
      {showCitySearch && (
        <View style={[styles.citySearchCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={[styles.cityInputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <MapPin size={16} color={colors.primary} />
            <TextInput
              style={[styles.cityTextInput, { color: colors.text }]}
              value={cityQuery}
              onChangeText={handleCitySearch}
              placeholder="Search any village, town, or city..."
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            {isSearchingCity ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Search size={14} color={colors.textSecondary} />
            )}
          </View>

          {citySuggestions.length > 0 && (
            <View style={styles.citySuggestionsList}>
              {citySuggestions.map((city, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.citySugItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleSelectCity(city)}
                >
                  <MapPin size={13} color={colors.primary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sugCityTitle, { color: colors.text }]}>
                      {city.name} {city.district && city.district !== city.name ? `(${city.district})` : ""}
                    </Text>
                    <Text style={[styles.sugCitySubtitle, { color: colors.textSecondary }]}>
                      {city.state ? `${city.state}, ` : ""}{city.country} • Lat: {city.lat.toFixed(2)}°, Lng: {city.lng.toFixed(2)}°
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Date Navigator Bar */}
      <View style={[styles.dateNavRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.dateNavBtn, { backgroundColor: colors.background }]}
          onPress={() => changeDateByDays(-1)}
        >
          <ChevronLeft size={18} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dateDisplayBtn, isToday && { backgroundColor: colors.primaryLight }]}
          onPress={() => setDatePickerVisible(true)}
        >
          <Calendar size={15} color={colors.primary} />
          <Text style={[styles.dateDisplayText, { color: colors.text }]}>
            {formatDateDisplay(currentDate)}
          </Text>
          {isToday && (
            <View style={[styles.todayBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.todayBadgeText}>TODAY</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dateNavBtn, { backgroundColor: colors.background }]}
          onPress={() => changeDateByDays(1)}
        >
          <ChevronRight size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {panchang && (
          <>
            {/* Hero Cosmic Samvat & Sun/Moon Sign Card */}
            <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={styles.samvatHeader}>
                    ✨ VIKRAM SAMVAT {panchang.vikramSamvat} • SHAKA {panchang.shakaSamvat}
                  </Text>
                  <Text style={styles.heroTitle}>
                    {selectedLang === "sa"
                      ? `${panchang.vedicMonthSanskrit} • ${panchang.dayNameSanskrit}`
                      : selectedLang === "hi"
                      ? `${panchang.vedicMonth} मास • ${panchang.dayName}`
                      : `${panchang.vedicMonth} Masa • ${panchang.dayName}`}
                  </Text>
                </View>
                <View style={styles.ayanaBadge}>
                  <Text style={styles.ayanaBadgeText}>
                    {selectedLang === "sa" ? panchang.ayanaSanskrit : panchang.ayana}
                  </Text>
                </View>
              </View>

              <View style={styles.heroSunMoonRow}>
                <View style={styles.sunMoonItem}>
                  <Sun size={18} color="#fde047" />
                  <Text style={styles.sunMoonLabel}>Sun in {panchang.sunSign} (सूर्य)</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.sunMoonItem}>
                  <Moon size={18} color="#e0e7ff" />
                  <Text style={styles.sunMoonLabel}>Moon in {panchang.moonSign} (चन्द्र)</Text>
                </View>
              </View>

              <View style={styles.rituRow}>
                <Text style={styles.rituText}>
                  🌸 Season (ऋतु): {selectedLang === "sa" ? panchang.rituSanskrit : panchang.ritu} • Location: {panchang.city.name}
                </Text>
              </View>
            </View>

            {/* The 5 Limbs (पञ्च-अङ्ग) Visual Cards Grid */}
            <Text style={[styles.sectionHeading, { color: colors.primary }]}>
              Pancha-Anga (पञ्चाङ्ग के ५ प्रमुख अंग)
            </Text>

            <View style={styles.angasGrid}>
              {/* 1. TITHI */}
              <View style={[styles.angaCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={styles.angaHeader}>
                  <Moon size={16} color={colors.primary} />
                  <Text style={[styles.angaTag, { color: colors.primary }]}>1. TITHI (तिथि)</Text>
                </View>
                <Text style={[styles.angaMainText, { color: colors.text }]}>
                  {selectedLang === "sa" ? panchang.tithi.nameSanskrit : panchang.tithi.name}
                </Text>
                <Text style={[styles.angaSubText, { color: colors.textSecondary }]}>
                  {selectedLang === "sa" ? panchang.tithi.pakshaSanskrit : `${panchang.tithi.paksha} Paksha`} • {panchang.tithi.percentage}% passed
                </Text>
              </View>

              {/* 2. VARA */}
              <View style={[styles.angaCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={styles.angaHeader}>
                  <Sun size={16} color={colors.primary} />
                  <Text style={[styles.angaTag, { color: colors.primary }]}>2. VARA (वार)</Text>
                </View>
                <Text style={[styles.angaMainText, { color: colors.text }]}>
                  {selectedLang === "sa" ? panchang.vara.nameSanskrit : panchang.vara.name}
                </Text>
                <Text style={[styles.angaSubText, { color: colors.textSecondary }]}>
                  Lord: {selectedLang === "sa" ? panchang.vara.rulingPlanetSanskrit : panchang.vara.rulingPlanet}
                </Text>
              </View>

              {/* 3. NAKSHATRA */}
              <View style={[styles.angaCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={styles.angaHeader}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.angaTag, { color: colors.primary }]}>3. NAKSHATRA (नक्षत्र)</Text>
                </View>
                <Text style={[styles.angaMainText, { color: colors.text }]}>
                  {selectedLang === "sa" ? panchang.nakshatra.nameSanskrit : panchang.nakshatra.name}
                </Text>
                <Text style={[styles.angaSubText, { color: colors.textSecondary }]}>
                  Pada {panchang.nakshatra.pada} • Lord: {panchang.nakshatra.lord}
                </Text>
              </View>

              {/* 4. YOGA */}
              <View style={[styles.angaCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                <View style={styles.angaHeader}>
                  <Compass size={16} color={colors.primary} />
                  <Text style={[styles.angaTag, { color: colors.primary }]}>4. YOGA (योग)</Text>
                </View>
                <Text style={[styles.angaMainText, { color: colors.text }]}>
                  {selectedLang === "sa" ? panchang.yoga.nameSanskrit : panchang.yoga.name}
                </Text>
                <Text style={[styles.angaSubText, { color: colors.textSecondary }]}>
                  {panchang.yoga.nature}
                </Text>
              </View>

              {/* 5. KARANA */}
              <View style={[styles.angaCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, width: "100%" }]}>
                <View style={styles.angaHeader}>
                  <Flame size={16} color={colors.primary} />
                  <Text style={[styles.angaTag, { color: colors.primary }]}>5. KARANA (करण)</Text>
                </View>
                <Text style={[styles.angaMainText, { color: colors.text }]}>
                  {selectedLang === "sa" ? panchang.karana.nameSanskrit : panchang.karana.name} ({panchang.karana.type})
                </Text>
                <Text style={[styles.angaSubText, { color: colors.textSecondary }]}>
                  Half of active Tithi span
                </Text>
              </View>
            </View>

            {/* Auspicious & Inauspicious Timings (मुहूर्त एवं काल) */}
            <Text style={[styles.sectionHeading, { color: colors.primary, marginTop: 18 }]}>
              Daily Muhurtas & Solar Timings (मुहूर्त एवं काल)
            </Text>

            <View style={[styles.timingsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              {/* Sun & Moon Rise */}
              <View style={styles.timingRow}>
                <View style={styles.timeBlock}>
                  <Sun size={15} color="#f59e0b" />
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Sunrise (सूर्योदय)</Text>
                  <Text style={[styles.timeVal, { color: colors.text }]}>{panchang.sunrise}</Text>
                </View>
                <View style={styles.timeBlock}>
                  <Sun size={15} color="#ef4444" />
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Sunset (सूर्यास्त)</Text>
                  <Text style={[styles.timeVal, { color: colors.text }]}>{panchang.sunset}</Text>
                </View>
              </View>

              <View style={[styles.timingDivider, { backgroundColor: colors.border }]} />

              {/* Auspicious Timings */}
              <View style={styles.muhurtaSection}>
                <View style={styles.muhurtaItem}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.muhurtaTitle, { color: colors.text }]}>
                      Abhijit Muhurta (अभिजीत मुहूर्त - सर्वकार्य सिद्धि)
                    </Text>
                    <Text style={[styles.muhurtaTime, { color: "#10b981" }]}>
                      {panchang.abhijitMuhurta}
                    </Text>
                  </View>
                </View>

                <View style={styles.muhurtaItem}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.muhurtaTitle, { color: colors.text }]}>
                      Brahma Muhurta (ब्रह्म मुहूर्त - ध्यान एवं स्वाध्याय)
                    </Text>
                    <Text style={[styles.muhurtaTime, { color: "#10b981" }]}>
                      {panchang.brahmaMuhurta}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.timingDivider, { backgroundColor: colors.border }]} />

              {/* Inauspicious Timings (Varjya) */}
              <View style={styles.muhurtaSection}>
                <View style={styles.muhurtaItem}>
                  <AlertCircle size={16} color="#ef4444" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.muhurtaTitle, { color: colors.text }]}>
                      Rahu Kalam (राहु काल - वर्ज्य समय)
                    </Text>
                    <Text style={[styles.muhurtaTime, { color: "#ef4444" }]}>
                      {panchang.rahuKalam}
                    </Text>
                  </View>
                </View>

                <View style={styles.muhurtaItem}>
                  <AlertCircle size={16} color="#f59e0b" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.muhurtaTitle, { color: colors.text }]}>
                      Yamaganda (यमगण्ड काल)
                    </Text>
                    <Text style={[styles.muhurtaTime, { color: "#f59e0b" }]}>
                      {panchang.yamaganda}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Daily Gochar Kundli (Sky Chart) */}
            <NorthIndianKundliChart
              houses={calculateVedicKundli({
                fullName: "Daily Sky",
                gender: "other",
                dob: currentDate.toISOString().split("T")[0],
                tob: "06:00",
                pob: selectedCity.name,
                location: selectedCity,
                language: selectedLang,
              }).houses}
              lagnaRashiIndex={Math.max(
                0,
                RASHIS.findIndex(
                  (r) =>
                    r.en === panchang.sunSign ||
                    r.hi === panchang.sunSign ||
                    r.sa === panchang.sunSign
                )
              )}
              lagnaName={panchang.sunSign}
              title={
                selectedLang === "hi"
                  ? "दैनिक गोचर कुण्डली (Daily Transit Chart)"
                  : selectedLang === "sa"
                  ? "दैनिक गोचर चक्रम्"
                  : "Daily Gochar Kundli (Sky Chart)"
              }
              subtitle={
                selectedLang === "hi"
                  ? `सूर्य लग्न: ${panchang.sunSign} • चन्द्र: ${panchang.moonSign}`
                  : selectedLang === "sa"
                  ? `सूर्य लग्न: ${panchang.sunSign} • चन्द्र: ${panchang.moonSign}`
                  : `Surya Lagna: ${panchang.sunSign} • Moon: ${panchang.moonSign}`
              }
            />

            {/* Daily Gita Shloka Card */}
            <View style={[styles.gitaCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.gitaTop}>
                <BookOpen size={16} color={colors.primary} />
                <Text style={[styles.gitaSource, { color: colors.primary }]}>
                  Panchang Shloka • {panchang.dailyShloka.source}
                </Text>
              </View>

              <Text style={[styles.gitaSanskrit, { color: colors.text }]}>
                "{panchang.dailyShloka.verse}"
              </Text>

              <Text style={[styles.gitaTranslation, { color: colors.textSecondary }]}>
                {panchang.dailyShloka.translation}
              </Text>

              <TouchableOpacity
                style={[styles.audioBtn, { backgroundColor: colors.primaryLight }]}
                onPress={() => speakVerse(panchang.dailyShloka.verse)}
              >
                <Volume2 size={16} color={colors.primary} />
                <Text style={[styles.audioBtnText, { color: colors.primary }]}>
                  {speakingVerse ? "Stop Chanting" : "Chant Shloka (श्रवणम्)"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },
  screenSubtitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  cityToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: 100,
  },
  cityToggleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  langRibbon: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
    gap: 8,
  },
  langLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  langButtonsGroup: {
    flexDirection: "row",
    gap: 6,
    marginLeft: "auto",
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  citySearchCard: {
    padding: 14,
    borderBottomWidth: 1,
  },
  cityInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  cityTextInput: {
    flex: 1,
    fontSize: 14,
  },
  citySuggestionsList: {
    marginTop: 8,
    maxHeight: 160,
  },
  citySugItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sugCityTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  sugCitySubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  dateNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dateNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDisplayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dateDisplayText: {
    fontSize: 14,
    fontWeight: "700",
  },
  todayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  samvatHeader: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    opacity: 0.9,
    marginBottom: 4,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  ayanaBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ayanaBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  heroSunMoonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  sunMoonItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sunMoonLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  heroDivider: {
    width: 1,
    height: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  rituRow: {
    alignItems: "center",
  },
  rituText: {
    color: "#fff",
    fontSize: 11,
    opacity: 0.95,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  angasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  angaCard: {
    width: "48%",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  angaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  angaTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  angaMainText: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  angaSubText: {
    fontSize: 11,
  },
  timingsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  timingRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 6,
  },
  timeBlock: {
    alignItems: "center",
    gap: 2,
  },
  timeLabel: {
    fontSize: 11,
  },
  timeVal: {
    fontSize: 14,
    fontWeight: "bold",
  },
  timingDivider: {
    height: 1,
    marginVertical: 12,
  },
  muhurtaSection: {
    gap: 10,
  },
  muhurtaItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  muhurtaTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  muhurtaTime: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  gitaCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  gitaTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  gitaSource: {
    fontSize: 13,
    fontWeight: "700",
  },
  gitaSanskrit: {
    fontSize: 15,
    fontWeight: "700",
    fontStyle: "italic",
    lineHeight: 23,
    marginBottom: 8,
  },
  gitaTranslation: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  audioBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
    gap: 6,
  },
  audioBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
