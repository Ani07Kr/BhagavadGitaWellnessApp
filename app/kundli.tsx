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
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Sparkles,
  Compass,
  BookOpen,
  Volume2,
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  CheckCircle2,
  Globe,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  X,
} from "lucide-react-native";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BirthDetails,
  KundliData,
  calculateVedicKundli,
  generateAIKundliReport,
  RASHIS,
} from "@/services/jyotishEngine";
import { searchCitiesLive, CityLocation, CITIES_DATABASE } from "@/services/citiesDatabase";
import VedicDatePicker from "@/components/VedicDatePicker";
import VedicTimePicker from "@/components/VedicTimePicker";
import NorthIndianKundliChart from "@/components/NorthIndianKundliChart";
import VedicAstrologerBot from "@/components/VedicAstrologerBot";
import { NaturalVoiceAssistant } from "@/services/voiceAssistant";

type TabType = "varshphal" | "chart" | "planets" | "bot" | "remedies";

export interface SavedKundliProfile {
  id: string;
  name: string;
  relationship: string; // "Self", "Spouse", "Child", "Parent", "Friend", "Other"
  details: BirthDetails;
  data: KundliData;
  createdAt: string;
}

const RELATIONSHIPS = [
  { id: "Self", label: "Self (स्वयं)" },
  { id: "Spouse", label: "Spouse (जीवनसाथी)" },
  { id: "Child", label: "Child (संतान)" },
  { id: "Parent", label: "Parent (माता/पिता)" },
  { id: "Friend", label: "Friend (मित्र)" },
  { id: "Other", label: "Other (अन्य)" },
];

export default function KundliScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { locale, setLocale } = useLanguage();

  const [currentTab, setCurrentTab] = useState<TabType>("varshphal");
  const [loading, setLoading] = useState(false);
  const [speakingVerse, setSpeakingVerse] = useState(false);

  // Pickers Modal State
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Profiles State
  const [profiles, setProfiles] = useState<SavedKundliProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formGender, setFormGender] = useState<"male" | "female" | "other">("male");
  const [formRelationship, setFormRelationship] = useState("Self");
  const [formDob, setFormDob] = useState("1998-05-15");
  const [formTob, setFormTob] = useState("07:30");
  const [formPob, setFormPob] = useState("Varanasi (Kashi), Uttar Pradesh, India");
  const [selectedLocation, setSelectedLocation] = useState<CityLocation>(CITIES_DATABASE[0]);
  const [citySuggestions, setCitySuggestions] = useState<CityLocation[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "sa">(
    (locale as "en" | "hi" | "sa") || "en"
  );

  // Storage key uniquely scoped to the logged-in user ID (Guests have no persistent storage key)
  const getKundliStorageKey = () => {
    if (!user || user.isGuest || !user.id) {
      return null;
    }
    return `vedic_kundli_profiles_user_${user.id}`;
  };

  // Load Saved Kundli Profiles from AsyncStorage on mount / user change
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        if (!user || user.isGuest) {
          // Guest User Privacy: Never load any other user's saved profiles!
          setProfiles([]);
          setActiveProfileId(null);
          setFormName("");
          setIsAddingProfile(true);
          return;
        }

        const storageKey = getKundliStorageKey();
        if (storageKey) {
          const stored = await AsyncStorage.getItem(storageKey);
          if (stored) {
            const parsed: SavedKundliProfile[] = JSON.parse(stored);
            if (parsed && parsed.length > 0) {
              setProfiles(parsed);
              setActiveProfileId(parsed[0].id);
              setIsAddingProfile(false);
              return;
            }
          }
        }

        // If no profiles exist yet for this specific user
        const defaultName =
          user.user_metadata?.display_name ||
          (user.email ? user.email.split("@")[0] : "");

        setProfiles([]);
        setActiveProfileId(null);
        setFormName(defaultName);
        setIsAddingProfile(true);
      } catch (err) {
        console.error("Error loading profiles:", err);
        setProfiles([]);
        setIsAddingProfile(true);
      }
    };

    loadProfiles();
  }, [user?.id, user?.isGuest]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || null;

  const [isSearchingCity, setIsSearchingCity] = useState(false);

  // Handle City Input Change with live universal geocoding
  const handleCityInputChange = async (text: string) => {
    setFormPob(text);
    if (text.trim().length >= 2) {
      setIsSearchingCity(true);
      setShowCityDropdown(true);
      try {
        const results = await searchCitiesLive(text);
        setCitySuggestions(results);
      } catch (err) {
        console.warn("City search error:", err);
      } finally {
        setIsSearchingCity(false);
      }
    } else {
      setCitySuggestions([]);
      setShowCityDropdown(false);
    }
  };

  const handleSelectCity = (city: CityLocation) => {
    const parts = [city.name];
    if (city.district && city.district !== city.name) parts.push(city.district);
    if (city.state) parts.push(city.state);
    if (city.country) parts.push(city.country);

    const displayName = parts.join(", ");
    setFormPob(displayName);
    setSelectedLocation(city);
    setShowCityDropdown(false);
  };

  // Save new or updated Kundli Profile with authentic calculation
  const handleSaveAndGenerate = async () => {
    if (!formName.trim()) {
      Alert.alert("Missing Name", "Please enter the full name for the Kundli.");
      return;
    }

    setLoading(true);

    const details: BirthDetails = {
      fullName: formName.trim(),
      gender: formGender,
      dob: formDob.trim(),
      tob: formTob.trim(),
      pob: formPob.trim(),
      location: selectedLocation,
      language: selectedLang,
    };

    try {
      // Calculate authentic astronomical Sidereal Kundli + AI Varshphal
      const report = await generateAIKundliReport(details);

      const newProfile: SavedKundliProfile = {
        id: Date.now().toString(),
        name: details.fullName,
        relationship: formRelationship,
        details,
        data: report,
        createdAt: new Date().toISOString(),
      };

      const updatedProfiles = [newProfile, ...profiles.filter((p) => p.id !== newProfile.id)];
      setProfiles(updatedProfiles);
      setActiveProfileId(newProfile.id);
      setIsAddingProfile(false);

      // Persist permanently in AsyncStorage only for authenticated non-guest users
      const storageKey = getKundliStorageKey();
      if (storageKey) {
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(updatedProfiles)
        );
      }
    } catch (err) {
      console.error("Error generating Kundli:", err);
      const fallbackReport = calculateVedicKundli(details);
      const fallbackProfile: SavedKundliProfile = {
        id: Date.now().toString(),
        name: details.fullName,
        relationship: formRelationship,
        details,
        data: fallbackReport,
        createdAt: new Date().toISOString(),
      };

      const updated = [fallbackProfile, ...profiles];
      setProfiles(updated);
      setActiveProfileId(fallbackProfile.id);
      setIsAddingProfile(false);

      const storageKey = getKundliStorageKey();
      if (storageKey) {
        await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
      }
    } finally {
      setLoading(false);
    }
  };

  // Re-generate current active profile in a new language
  const handleLanguageChange = async (lang: "en" | "hi" | "sa") => {
    setSelectedLang(lang);
    setLocale(lang);

    if (activeProfile) {
      setLoading(true);
      const updatedDetails: BirthDetails = {
        ...activeProfile.details,
        language: lang,
      };

      try {
        const newReport = await generateAIKundliReport(updatedDetails);
        const updatedProfiles = profiles.map((p) =>
          p.id === activeProfile.id
            ? { ...p, details: updatedDetails, data: newReport }
            : p
        );

        setProfiles(updatedProfiles);

        const storageKey = getKundliStorageKey();
        if (storageKey) {
          await AsyncStorage.setItem(
            storageKey,
            JSON.stringify(updatedProfiles)
          );
        }
      } catch (err) {
        console.error("Error regenerating in new language:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Delete a profile
  const handleDeleteProfile = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    const remaining = profiles.filter((p) => p.id !== id);
    setProfiles(remaining);

    const storageKey = getKundliStorageKey();
    if (storageKey) {
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify(remaining)
      );
    }

    if (remaining.length > 0) {
      setActiveProfileId(remaining[0].id);
    } else {
      setActiveProfileId(null);
      setIsAddingProfile(true);
    }
    setDeleteTarget(null);
  };

  const openAddOtherModal = () => {
    setFormName("");
    setFormRelationship("Spouse");
    setFormDob("1999-08-20");
    setFormTob("09:15");
    setFormPob("New Delhi, Delhi, India");
    setSelectedLocation(CITIES_DATABASE[1]); // New Delhi
    setIsAddingProfile(true);
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

  const handleBack = () => {
    NaturalVoiceAssistant.stop();
    if (isAddingProfile && profiles.length > 0) {
      setIsAddingProfile(false);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Date and Time Picker Modals */}
      <VedicDatePicker
        visible={datePickerVisible}
        value={formDob}
        onSelect={(d) => setFormDob(d)}
        onClose={() => setDatePickerVisible(false)}
      />

      <VedicTimePicker
        visible={timePickerVisible}
        value={formTob}
        onSelect={(t) => setFormTob(t)}
        onClose={() => setTimePickerVisible(false)}
      />

      {/* Cross-Platform Delete Confirmation Modal */}
      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.deleteModalCard,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
            ]}
          >
            <View style={[styles.deleteIconCircle, { backgroundColor: "#fee2e2" }]}>
              <Trash2 size={24} color={colors.danger} />
            </View>

            <Text style={[styles.deleteModalTitle, { color: colors.text }]}>
              Delete Janam Kundli (जन्म कुंडली)?
            </Text>
            <Text style={[styles.deleteModalDesc, { color: colors.textSecondary }]}>
              Are you sure you want to remove the Kundli for{" "}
              <Text style={{ fontWeight: "bold", color: colors.text }}>
                {deleteTarget?.name}
              </Text>
              ? This saved profile will be permanently removed.
            </Text>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelModalBtn,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={[styles.cancelModalBtnText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmDeleteBtn, { backgroundColor: colors.danger }]}
                onPress={confirmDelete}
              >
                <Trash2 size={16} color="#fff" />
                <Text style={styles.confirmDeleteBtnText}>Delete (हटाएं)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}
          onPress={handleBack}
        >
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Vedic Janam Kundli (जन्म कुंडली)</Text>
          <Text style={[styles.screenSubtitle, { color: colors.primary }]}>जन्म कुण्डली एवं वर्षफल</Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={openAddOtherModal}
        >
          <Plus size={16} color="#fff" />
          <Text style={styles.addButtonText}>For Others</Text>
        </TouchableOpacity>
      </View>

      {/* Language Switcher Ribbon */}
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

      {/* Saved Profiles Horizontal Selector */}
      {profiles.length > 0 && !isAddingProfile && (
        <View style={[styles.profilesBar, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profilesScroll}>
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.profileChip,
                    {
                      backgroundColor: isActive ? colors.primary : colors.background,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setActiveProfileId(p.id);
                    setIsAddingProfile(false);
                  }}
                >
                  <UserIcon size={13} color={isActive ? "#fff" : colors.text} />
                  <Text
                    style={[
                      styles.profileChipText,
                      { color: isActive ? "#fff" : colors.text, fontWeight: isActive ? "700" : "500" },
                    ]}
                    numberOfLines={1}
                  >
                    {p.name} ({p.relationship})
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Quick Add Button in Strip */}
            <TouchableOpacity
              style={[styles.addChip, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
              onPress={openAddOtherModal}
            >
              <Plus size={14} color={colors.primary} />
              <Text style={[styles.addChipText, { color: colors.primary }]}>+ Add Person</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Form Mode: Adding New Profile or First Entry */}
        {isAddingProfile ? (
          <View style={[styles.formCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={styles.formTopRow}>
              <View>
                <Text style={[styles.formHeading, { color: colors.primary }]}>
                  {profiles.length === 0 ? "Create Authentic Vedic Kundli" : "Check Kundli For Others"}
                </Text>
                <Text style={[styles.formSubheading, { color: colors.textSecondary }]}>
                  Precision Sidereal calculation based on exact birth time, date & coordinates
                </Text>
              </View>
              {profiles.length > 0 && (
                <TouchableOpacity
                  style={[styles.cancelBtn, { backgroundColor: colors.background }]}
                  onPress={() => setIsAddingProfile(false)}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Relationship Selector */}
            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 10 }]}>Relationship (सम्बन्ध)</Text>
            <View style={styles.relationshipGrid}>
              {RELATIONSHIPS.map((rel) => {
                const isSelected = formRelationship === rel.id;
                return (
                  <TouchableOpacity
                    key={rel.id}
                    style={[
                      styles.relChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.background,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setFormRelationship(rel.id)}
                  >
                    <Text style={[styles.relChipText, { color: isSelected ? "#fff" : colors.text }]}>
                      {rel.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name (पूरा नाम)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <UserIcon size={16} color={colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="e.g. Priya Sharma"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Gender (लिंग)</Text>
              <View style={styles.genderRow}>
                {(["male", "female", "other"] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderBtn,
                      {
                        backgroundColor: formGender === g ? colors.primaryLight : colors.background,
                        borderColor: formGender === g ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setFormGender(g)}
                  >
                    <Text
                      style={[
                        styles.genderBtnText,
                        { color: formGender === g ? colors.primary : colors.text, fontWeight: formGender === g ? "700" : "500" },
                      ]}
                    >
                      {g === "male" ? "Male (पुरुष)" : g === "female" ? "Female (स्त्री)" : "Other (अन्य)"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Interactive Date of Birth & Time of Birth (Click to open Calendar / Clock) */}
            <View style={styles.rowInputs}>
              {/* Date of Birth Picker Button */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Date of Birth (कैलेंडर)</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.primary }]}
                  onPress={() => setDatePickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Calendar size={16} color={colors.primary} />
                  <Text style={[styles.pickerValueText, { color: colors.text }]}>
                    {formDob}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Time of Birth Picker Button */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Time of Birth (घड़ी)</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.primary }]}
                  onPress={() => setTimePickerVisible(true)}
                  activeOpacity={0.7}
                >
                  <Clock size={16} color={colors.primary} />
                  <Text style={[styles.pickerValueText, { color: colors.text }]}>
                    {formTob}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Place of Birth with Live City Suggestions Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Place of Birth (गाँव, शहर, जिला या राज्य)</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <MapPin size={16} color={colors.primary} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={formPob}
                  onChangeText={handleCityInputChange}
                  placeholder="Type any village, town, or city (e.g. Chandrapura, Bokaro, Varanasi...)"
                  placeholderTextColor={colors.textSecondary}
                  onFocus={() => {
                    if (formPob.trim().length >= 2) {
                      handleCityInputChange(formPob);
                    }
                  }}
                />
                {isSearchingCity ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Search size={14} color={colors.textSecondary} />
                )}
              </View>

              {/* City & Village Suggestions Dropdown List */}
              {showCityDropdown && (
                <View style={[styles.suggestionsBox, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  {citySuggestions.length > 0 ? (
                    citySuggestions.map((city, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                        onPress={() => handleSelectCity(city)}
                      >
                        <MapPin size={14} color={colors.primary} style={{ marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.sugCityName, { color: colors.text }]}>
                            {city.name} {city.district && city.district !== city.name ? `(${city.district})` : ""}
                          </Text>
                          <Text style={[styles.sugStateCountry, { color: colors.textSecondary }]}>
                            {city.state ? `${city.state}, ` : ""}{city.country} • Lat: {city.lat.toFixed(2)}°, Lng: {city.lng.toFixed(2)}°
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : isSearchingCity ? (
                    <View style={{ padding: 12, alignItems: "center" }}>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>Searching all places & villages...</Text>
                    </View>
                  ) : (
                    <View style={{ padding: 12, alignItems: "center" }}>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>No matching places found</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveAndGenerate}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.generateBtnText}>Calculating Astronomical Ephemeris...</Text>
                </View>
              ) : (
                <Text style={styles.generateBtnText}>
                  {profiles.length === 0 ? "Generate & Save My Kundli" : "Generate & Save Kundli"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : activeProfile ? (
          /* Profile Details View */
          <>
            {/* Person Card */}
            <View style={[styles.bioCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <View style={styles.bioHeader}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[styles.personName, { color: colors.text }]}>{activeProfile.name}</Text>
                    <View style={[styles.relationTag, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.relationTagText, { color: colors.primary }]}>
                        {activeProfile.relationship}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.personMeta, { color: colors.textSecondary }]}>
                    🎂 {activeProfile.details.dob} • ⏰ {activeProfile.details.tob} • 📍 {activeProfile.details.pob}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: colors.background }]}
                  onPress={() => handleDeleteProfile(activeProfile.id, activeProfile.name)}
                >
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>

              {/* 4 Astrological Pillars (Moon Sign, Sun Sign, Lagna, Nakshatra) */}
              <View style={[styles.quadStatsGrid, { borderTopColor: colors.border }]}>
                <View style={styles.quadStat}>
                  <Text style={[styles.triStatLabel, { color: colors.textSecondary }]}>MOON SIGN (चन्द्र राशि)</Text>
                  <Text style={[styles.triStatValue, { color: colors.primary }]}>
                    {activeProfile.data.rashi}
                  </Text>
                  <Text style={[styles.subLordText, { color: colors.textSecondary }]}>
                    Lord: {activeProfile.data.rashiLord}
                  </Text>
                </View>

                <View style={styles.quadStat}>
                  <Text style={[styles.triStatLabel, { color: colors.textSecondary }]}>SUN SIGN (सूर्य राशि)</Text>
                  <Text style={[styles.triStatValue, { color: colors.primary }]}>
                    {activeProfile.data.sunSign || "Aries"}
                  </Text>
                  <Text style={[styles.subLordText, { color: colors.textSecondary }]}>
                    {activeProfile.data.sunDegree || "0°"} ({activeProfile.data.sunNakshatra || "Krittika"})
                  </Text>
                </View>

                <View style={styles.quadStat}>
                  <Text style={[styles.triStatLabel, { color: colors.textSecondary }]}>ASCENDANT (लग्न)</Text>
                  <Text style={[styles.triStatValue, { color: colors.primary }]}>
                    {activeProfile.data.lagna}
                  </Text>
                  <Text style={[styles.subLordText, { color: colors.textSecondary }]}>
                    {activeProfile.data.lagnaDegree}
                  </Text>
                </View>

                <View style={styles.quadStat}>
                  <Text style={[styles.triStatLabel, { color: colors.textSecondary }]}>NAKSHATRA (नक्षत्र)</Text>
                  <Text style={[styles.triStatValue, { color: colors.primary }]}>
                    {activeProfile.data.nakshatra}
                  </Text>
                  <Text style={[styles.subLordText, { color: colors.textSecondary }]}>
                    Pada {activeProfile.data.pada} ({activeProfile.data.nakshatraLord})
                  </Text>
                </View>
              </View>

              <View style={[styles.dashaBanner, { backgroundColor: colors.primaryLight }]}>
                <Compass size={14} color={colors.primary} />
                <Text style={[styles.dashaText, { color: colors.primary }]}>
                  {activeProfile.data.currentDasha}
                </Text>
              </View>

              <View style={{ marginTop: 6, alignItems: "center" }}>
                <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                  Ayanamsha: {activeProfile.data.ayanamsha} • Classical Sidereal Chitrapaksha
                </Text>
              </View>
            </View>

            {/* Navigation Tabs */}
            <View style={[styles.tabBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.tabItem, currentTab === "varshphal" && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
                onPress={() => setCurrentTab("varshphal")}
              >
                <Text style={[styles.tabText, { color: currentTab === "varshphal" ? colors.primary : colors.textSecondary }]}>
                  Forecast
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, currentTab === "chart" && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
                onPress={() => setCurrentTab("chart")}
              >
                <Text style={[styles.tabText, { color: currentTab === "chart" ? colors.primary : colors.textSecondary }]}>
                  Kundli
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, currentTab === "planets" && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
                onPress={() => setCurrentTab("planets")}
              >
                <Text style={[styles.tabText, { color: currentTab === "planets" ? colors.primary : colors.textSecondary }]}>
                  Grahas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, currentTab === "bot" && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
                onPress={() => setCurrentTab("bot")}
              >
                <Text style={[styles.tabText, { color: currentTab === "bot" ? colors.primary : colors.textSecondary, fontWeight: currentTab === "bot" ? "700" : "600" }]}>
                  🤖 Vedic Bot
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, currentTab === "remedies" && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
                onPress={() => setCurrentTab("remedies")}
              >
                <Text style={[styles.tabText, { color: currentTab === "remedies" ? colors.primary : colors.textSecondary }]}>
                  Remedies
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab 1: 2026 Annual Varshphal */}
            {currentTab === "varshphal" && (
              <View style={styles.tabContent}>
                <View style={[styles.forecastHeaderCard, { backgroundColor: colors.primary }]}>
                  <Text style={styles.forecastYearText}>
                    ✨ VARSHPHAL {activeProfile.data.varshphal.year} (वि.सं. {activeProfile.data.varshphal.vikramSamvat})
                  </Text>
                  <Text style={styles.forecastThemeText}>
                    {activeProfile.data.varshphal.annualTheme}
                  </Text>
                </View>

                {/* Career & Wealth */}
                <View style={[styles.forecastSectionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[styles.sectionHeading, { color: colors.primary }]}>
                    💼 Career & Vocation (कर्म, अर्थ एवं व्यवसाय)
                  </Text>
                  <Text style={[styles.sectionBodyText, { color: colors.text }]}>
                    {activeProfile.data.varshphal.careerAndWealth}
                  </Text>
                </View>

                {/* Health & Vitality */}
                <View style={[styles.forecastSectionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[styles.sectionHeading, { color: colors.primary }]}>
                    🧘 Health, Vitality & Prana (आरोग्य एवं प्राण)
                  </Text>
                  <Text style={[styles.sectionBodyText, { color: colors.text }]}>
                    {activeProfile.data.varshphal.healthAndVitality}
                  </Text>
                </View>

                {/* Relationships & Peace */}
                <View style={[styles.forecastSectionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[styles.sectionHeading, { color: colors.primary }]}>
                    🌸 Relationships & Peace (सम्बन्ध एवं शांति)
                  </Text>
                  <Text style={[styles.sectionBodyText, { color: colors.text }]}>
                    {activeProfile.data.varshphal.relationshipsAndPeace}
                  </Text>
                </View>

                {/* Spiritual Awakening */}
                <View style={[styles.forecastSectionCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[styles.sectionHeading, { color: colors.primary }]}>
                    🕊️ Spiritual Awakening (आत्म-ज्ञान एवं मोक्ष)
                  </Text>
                  <Text style={[styles.sectionBodyText, { color: colors.text }]}>
                    {activeProfile.data.varshphal.spiritualGuidance}
                  </Text>
                </View>
              </View>
            )}

            {/* Tab 2: Classical North Indian Kundli Chart */}
            {currentTab === "chart" && (
              <View style={styles.tabContent}>
                <NorthIndianKundliChart
                  houses={activeProfile.data.houses}
                  lagnaRashiIndex={Math.max(
                    0,
                    RASHIS.findIndex(
                      (r) =>
                        r.en === activeProfile.data.lagna ||
                        r.hi === activeProfile.data.lagna ||
                        r.sa === activeProfile.data.lagna
                    )
                  )}
                  lagnaName={activeProfile.data.lagna}
                  title={`${activeProfile.name}'s Janam Kundli (जन्म कुंडली)`}
                  subtitle={`Ascendant: ${activeProfile.data.lagna} (${activeProfile.data.lagnaDegree}) • Ayanamsha: Lahiri`}
                />
              </View>
            )}

            {/* Tab 3: Navagrahas / Planetary Positions */}
            {currentTab === "planets" && (
              <View style={styles.tabContent}>
                <View style={[styles.planetsTableCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[styles.chartHeaderTitle, { color: colors.primary, marginBottom: 12 }]}>
                    Navagrahas (नवग्रह स्थिति - Sidereal Longitude)
                  </Text>

                  <View style={[styles.tableHeaderRow, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.thCell, { color: colors.primary, flex: 1.2 }]}>Graha</Text>
                    <Text style={[styles.thCell, { color: colors.primary, flex: 1 }]}>Rashi</Text>
                    <Text style={[styles.thCell, { color: colors.primary, flex: 0.7 }]}>House</Text>
                    <Text style={[styles.thCell, { color: colors.primary, flex: 1 }]}>Degree</Text>
                  </View>

                  {activeProfile.data.planets.map((planet, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.tableRow,
                        { borderBottomColor: colors.border },
                        idx % 2 === 1 && { backgroundColor: colors.background },
                      ]}
                    >
                      <Text style={[styles.tdCell, { color: colors.text, flex: 1.2, fontWeight: "600" }]}>
                        {planet.planet}
                      </Text>
                      <Text style={[styles.tdCell, { color: colors.text, flex: 1 }]}>
                        {planet.rashi}
                      </Text>
                      <Text style={[styles.tdCell, { color: colors.primary, flex: 0.7, fontWeight: "bold" }]}>
                        {planet.house}
                      </Text>
                      <Text style={[styles.tdCell, { color: colors.textSecondary, flex: 1 }]}>
                        {planet.degree}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tab 4: AI Vedic Astrologer & Gita Bot */}
            {currentTab === "bot" && (
              <View style={styles.tabContent}>
                <VedicAstrologerBot
                  kundli={activeProfile.data}
                  personName={activeProfile.name}
                  language={selectedLang}
                />
              </View>
            )}

            {/* Tab 5: Bhagavad Gita Remedies */}
            {currentTab === "remedies" && (
              <View style={styles.tabContent}>
                <View style={[styles.gitaRemedyCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <View style={styles.gitaTopRow}>
                    <BookOpen size={18} color={colors.primary} />
                    <Text style={[styles.gitaChapterTitle, { color: colors.primary }]}>
                      Prescribed Bhagavad Gita Shloka ({activeProfile.data.varshphal.recommendedGitaVerse.chapter})
                    </Text>
                  </View>

                  <Text style={[styles.gitaSanskritText, { color: colors.text }]}>
                    "{activeProfile.data.varshphal.recommendedGitaVerse.verse}"
                  </Text>

                  <Text style={[styles.gitaTranslationText, { color: colors.textSecondary }]}>
                    {activeProfile.data.varshphal.recommendedGitaVerse.translation}
                  </Text>

                  <TouchableOpacity
                    style={[styles.audioButton, { backgroundColor: colors.primaryLight }]}
                    onPress={() => speakVerse(activeProfile.data.varshphal.recommendedGitaVerse.verse)}
                  >
                    <Volume2 size={16} color={colors.primary} />
                    <Text style={[styles.audioButtonText, { color: colors.primary }]}>
                      {speakingVerse ? "Stop Chanting" : "Listen & Chant (श्रवणम्)"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Daily Vedic Remedies */}
                <View style={[styles.remedyListCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                  <Text style={[styles.sectionHeading, { color: colors.primary }]}>
                    Daily Vedic Upayas (दैनिक वैदिक उपाय)
                  </Text>

                  {activeProfile.data.varshphal.vedicRemedies.map((remedy, idx) => (
                    <View key={idx} style={styles.remedyItemRow}>
                      <CheckCircle2 size={18} color="#10b981" style={{ marginTop: 2 }} />
                      <Text style={[styles.remedyItemText, { color: colors.text }]}>{remedy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        ) : null}
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#fff",
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
  profilesBar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  profilesScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  profileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 180,
  },
  profileChipText: {
    fontSize: 12,
  },
  addChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  addChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  formTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  formHeading: {
    fontSize: 17,
    fontWeight: "bold",
  },
  formSubheading: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  relationshipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
    marginTop: 6,
  },
  relChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  relChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 12,
    position: "relative",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    minHeight: 42,
  },
  pickerValueText: {
    fontSize: 14,
    fontWeight: "600",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
  },
  suggestionsBox: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    maxHeight: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sugCityName: {
    fontSize: 13,
    fontWeight: "700",
  },
  sugStateCountry: {
    fontSize: 11,
    marginTop: 1,
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  genderBtnText: {
    fontSize: 12,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  generateBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
  },
  generateBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  bioCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  personName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  relationTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  relationTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  personMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quadStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  quadStat: {
    width: "47%",
    alignItems: "center",
    paddingVertical: 4,
  },
  triStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    marginBottom: 12,
  },
  triStat: {
    flex: 1,
    alignItems: "center",
  },
  triStatLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  triStatValue: {
    fontSize: 15,
    fontWeight: "bold",
  },
  subLordText: {
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  dashaBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dashaText: {
    fontSize: 12,
    fontWeight: "700",
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  tabContent: {
    gap: 14,
  },
  forecastHeaderCard: {
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  forecastYearText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 6,
    opacity: 0.9,
  },
  forecastThemeText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    lineHeight: 24,
  },
  forecastSectionCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionBodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  chartContainerCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  chartHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  chartHeaderSubtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  housesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  houseBox: {
    width: "31%",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  houseNumText: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  housePlanetsText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  planetsTableCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  thCell: {
    fontSize: 11,
    fontWeight: "800",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  tdCell: {
    fontSize: 12,
  },
  gitaRemedyCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  gitaTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  gitaChapterTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  gitaSanskritText: {
    fontSize: 15,
    fontWeight: "700",
    fontStyle: "italic",
    lineHeight: 23,
    marginBottom: 10,
  },
  gitaTranslationText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
    gap: 6,
  },
  audioButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  remedyListCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  remedyItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 10,
  },
  remedyItemText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  deleteModalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  deleteIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  deleteModalDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  deleteModalActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  confirmDeleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  confirmDeleteBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
