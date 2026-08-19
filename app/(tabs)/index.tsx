import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";
import { useLanguage } from "@/context/language";
import {
  Camera,
  Activity,
  Brain,
  Sparkles,
  Flame,
  Compass,
  Sun,
  Volume2,
  VolumeX,
  Radio,
  Shuffle,
  BookOpen,
} from "lucide-react-native";
import RecentActivity from "@/components/RecentActivity";
import VedicCosmicClock from "@/components/VedicCosmicClock";
import { NaturalVoiceAssistant } from "@/services/voiceAssistant";

interface GitaVerse {
  sanskrit: string;
  hindi: string;
  english: string;
  chapter: string;
  chapterHi: string;
}

const GITA_WISDOM_VERSES: GitaVerse[] = [
  {
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    hindi: "तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। इसलिए कर्मफल के हेतु मत बनो और न ही अकर्मण्यता में तुम्हारी आसक्ति हो।",
    english: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself the cause of results, nor be attached to inaction.",
    chapter: "Bhagavad Gita • Chapter 2, Verse 47",
    chapterHi: "श्रीमद्भगवद्गीता • अध्याय २, श्लोक ४७",
  },
  {
    sanskrit: "असंशयं महाबाहो मनो दुर्निग्रहं चलम्। अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते॥",
    hindi: "हे महाबाहो! निःसंदेह मन चंचल और कठिनता से वश में होने वाला है; किन्तु हे कुन्तीपुत्र! अभ्यास और वैराग्य से इसे वश में किया जाता है।",
    english: "O mighty-armed son of Kunti, the mind is indeed restless and difficult to curb, but it can be mastered through continuous practice and detachment.",
    chapter: "Bhagavad Gita • Chapter 6, Verse 35",
    chapterHi: "श्रीमद्भगवद्गीता • अध्याय ६, श्लोक ३५",
  },
  {
    sanskrit: "योगस्थ: कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्यो: समो भूत्वा समत्वं योग उच्यते॥",
    hindi: "हे धनंजय! आसक्ति को त्यागकर तथा सिद्धि और असिद्धि में समान भाव रखकर अपने कर्तव्य कर्म करो। यह समभाव ही योग कहलाता है।",
    english: "Perform your prescribed duties poised in Yoga, abandoning attachment to success and failure. Such equanimity of mind is called Yoga.",
    chapter: "Bhagavad Gita • Chapter 2, Verse 48",
    chapterHi: "श्रीमद्भगवद्गीता • अध्याय २, श्लोक ४८",
  },
  {
    sanskrit: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
    hindi: "हे भारत! जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं स्वयं को प्रकट करता हूँ।",
    english: "Whenever righteousness declines and unrighteousness prevails, O Bharata, I manifest Myself on earth to restore cosmic balance.",
    chapter: "Bhagavad Gita • Chapter 4, Verse 7",
    chapterHi: "श्रीमद्भगवद्गीता • अध्याय ४, श्लोक ७",
  },
  {
    sanskrit: "न हि ज्ञानेन सदृशं पवित्रमिह विद्यते। तत्स्वयं योगसंसिद्धः कालेनात्मनि विन्दति॥",
    hindi: "इस संसार में ज्ञान के समान पवित्र करने वाला कुछ भी नहीं है। योग में निष्णात पुरुष समय पाकर उस ज्ञान को स्वतः अपनी आत्मा में अनुभव करता है।",
    english: "In this world, there is nothing as purifying as transcendental knowledge. One who is perfected in Yoga realizes this truth within the self in due course of time.",
    chapter: "Bhagavad Gita • Chapter 4, Verse 38",
    chapterHi: "श्रीमद्भगवद्गीता • अध्याय ४, श्लोक ३८",
  },
  {
    sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
    hindi: "सभी सांसारिक बंधनों और चिंताओं को छोड़कर केवल मेरी शरण में आओ। मैं तुम्हें समस्त पापों और बंधनों से मुक्त कर दूंगा, शोक मत करो।",
    english: "Abandon all varieties of worldly anxiety and surrender exclusively unto Me. I shall deliver you from all bondage and distress; do not grieve.",
    chapter: "Bhagavad Gita • Chapter 18, Verse 66",
    chapterHi: "श्रीमद्भगवद्गीता • अध्याय १८, श्लोक ६६",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { locale } = useLanguage();

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "शुभ प्रभात • Good morning";
    if (hour < 18) return "शुभ दोपहर • Good afternoon";
    return "शुभ संध्या • Good evening";
  });

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [verseLang, setVerseLang] = useState<"en" | "hi" | "sa">(
    locale === "hi" || locale === "sa" ? locale : "en"
  );
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("male");
  const [speakingVerse, setSpeakingVerse] = useState(false);

  const currentVerse = GITA_WISDOM_VERSES[currentVerseIndex];

  useEffect(() => {
    return () => {
      NaturalVoiceAssistant.stop();
      setSpeakingVerse(false);
    };
  }, []);

  const handleNextVerse = () => {
    NaturalVoiceAssistant.stop();
    setSpeakingVerse(false);
    setCurrentVerseIndex((prev) => (prev + 1) % GITA_WISDOM_VERSES.length);
  };

  const handleGenderSwitch = (gender: "male" | "female") => {
    setVoiceGender(gender);
    if (speakingVerse) {
      NaturalVoiceAssistant.stop();
      setSpeakingVerse(false);
      // Re-trigger speech with new gender
      setTimeout(() => {
        speakCurrentVerse(gender);
      }, 100);
    }
  };

  const speakCurrentVerse = (overrideGender?: "male" | "female") => {
    const genderToUse = overrideGender || voiceGender;

    if (speakingVerse && !overrideGender) {
      NaturalVoiceAssistant.stop();
      setSpeakingVerse(false);
      return;
    }

    NaturalVoiceAssistant.stop();

    let fullSpeechText = "";
    let speechLang: "en" | "hi" | "sa" = "hi";

    if (verseLang === "hi") {
      fullSpeechText = `श्रीमद्भगवद्गीता श्लोक। ${currentVerse.sanskrit}। भावार्थ: ${currentVerse.hindi}`;
      speechLang = "hi";
    } else if (verseLang === "sa") {
      fullSpeechText = `श्रीमद्भगवद्गीता श्लोकः। ${currentVerse.sanskrit}`;
      speechLang = "sa";
    } else {
      fullSpeechText = `Bhagavad Gita Sacred Verse. ${currentVerse.sanskrit}. Meaning: ${currentVerse.english}`;
      speechLang = "en";
    }

    NaturalVoiceAssistant.speak(
      fullSpeechText,
      speechLang,
      genderToUse,
      () => setSpeakingVerse(true),
      () => setSpeakingVerse(false),
      () => setSpeakingVerse(false)
    );
  };

  const features = [
    {
      id: "questions",
      title: "Mental Assessment (मनो स्थिति)",
      description: "Evaluate your mental state & Tri-Guna balance with AI Vedic analysis",
      icon: <Brain size={24} color={colors.primary} />,
      onPress: () => router.push("/questions/1"),
    },
    {
      id: "panchang",
      title: "Daily Vedic Panchang (दैनिक पञ्चाङ्गम्)",
      description: "Live 5 Angas (Tithi, Vara, Nakshatra, Yoga, Karana), Muhurtas & Solar Timings",
      icon: <Sun size={24} color={colors.primary} />,
      onPress: () => router.push("/panchang"),
    },
    {
      id: "kundli",
      title: "Vedic Janam Kundli (जन्म कुंडली) & 2026 Forecast",
      description: "Complete birth chart, Sun/Moon signs, and multilingual annual astrology",
      icon: <Compass size={24} color={colors.primary} />,
      onPress: () => router.push("/kundli"),
    },
    {
      id: "face-detection",
      title: "Emotion Detection (भाव दर्शन)",
      description: "Analyze your facial expressions and emotional composure",
      icon: <Camera size={24} color={colors.primary} />,
      onPress: () => router.push("/face-detection"),
    },
    {
      id: "ecg-upload",
      title: "ECG Analysis (हृदय स्पंदन)",
      description: "Upload your ECG report to assess stress and heart coherence",
      icon: <Activity size={24} color={colors.primary} />,
      onPress: () => router.push("/ecg-upload"),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Vedic Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.secondary }]}>{greeting}</Text>
            <Text style={[styles.name, { color: colors.text }]}>
              {user?.user_metadata?.display_name || (user?.email ? user.email.split("@")[0] : "Seeker")}
            </Text>
          </View>
          <View style={[styles.omCircle, { backgroundColor: colors.primaryLight, borderColor: colors.border, borderWidth: 1 }]}>
            <Text style={[styles.omSymbol, { color: colors.primary }]}>ॐ</Text>
          </View>
        </View>

        {/* 🪐 Live Vedic Kaal Chakra / Cosmic Clock */}
        <VedicCosmicClock />

        {/* 🕉️ Enhanced Daily Vedic Sacred Verse Card with Multi-Lingual AI Voice */}
        <View style={[styles.quoteCard, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: 1 }]}>
          {/* Top Badge & Controls */}
          <View style={styles.quoteTopRow}>
            <View style={[styles.quoteBadge, { backgroundColor: colors.primaryLight }]}>
              <Flame size={13} color={colors.primary} />
              <Text style={[styles.quoteBadgeText, { color: colors.primary }]}>DAILY GITA WISDOM</Text>
            </View>

            {/* Voice Gender Pills */}
            <View style={[styles.genderToggleGroup, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.genderPill,
                  voiceGender === "male" && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleGenderSwitch("male")}
              >
                <Text
                  style={[
                    styles.genderPillText,
                    { color: voiceGender === "male" ? "#fff" : colors.textSecondary },
                  ]}
                >
                  👨 Male
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderPill,
                  voiceGender === "female" && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleGenderSwitch("female")}
              >
                <Text
                  style={[
                    styles.genderPillText,
                    { color: voiceGender === "female" ? "#fff" : colors.textSecondary },
                  ]}
                >
                  👩 Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3-Language Switcher Ribbon for Verse */}
          <View style={styles.verseLangBar}>
            <TouchableOpacity
              style={[
                styles.verseLangTab,
                verseLang === "hi" && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              ]}
              onPress={() => setVerseLang("hi")}
            >
              <Text style={[styles.verseLangTabText, { color: verseLang === "hi" ? colors.primary : colors.textSecondary }]}>
                हिन्दी भावार्थ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.verseLangTab,
                verseLang === "en" && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              ]}
              onPress={() => setVerseLang("en")}
            >
              <Text style={[styles.verseLangTabText, { color: verseLang === "en" ? colors.primary : colors.textSecondary }]}>
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.verseLangTab,
                verseLang === "sa" && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              ]}
              onPress={() => setVerseLang("sa")}
            >
              <Text style={[styles.verseLangTabText, { color: verseLang === "sa" ? colors.primary : colors.textSecondary }]}>
                संस्कृतम्
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sacred Sanskrit Verse */}
          <View style={[styles.sanskritBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.sanskritText, { color: colors.primary }]}>{currentVerse.sanskrit}</Text>
          </View>

          {/* Translation Text according to selected language */}
          {verseLang === "hi" ? (
            <Text style={[styles.quoteText, { color: colors.text }]}>"{currentVerse.hindi}"</Text>
          ) : verseLang === "en" ? (
            <Text style={[styles.quoteText, { color: colors.text }]}>"{currentVerse.english}"</Text>
          ) : null}

          {/* Chapter / Reference */}
          <Text style={[styles.quoteSource, { color: colors.textSecondary }]}>
            {verseLang === "hi" || verseLang === "sa" ? currentVerse.chapterHi : currentVerse.chapter}
          </Text>

          {/* Bottom Audio Action Bar */}
          <View style={styles.quoteBottomRow}>
            <TouchableOpacity
              style={[
                styles.listenChantBtn,
                {
                  backgroundColor: speakingVerse ? "#16a34a" : colors.primary,
                },
              ]}
              onPress={() => speakCurrentVerse()}
              activeOpacity={0.8}
            >
              {speakingVerse ? (
                <>
                  <Radio size={15} color="#fff" />
                  <Text style={styles.listenChantBtnText}>Stop Chanting</Text>
                </>
              ) : (
                <>
                  <Volume2 size={15} color="#fff" />
                  <Text style={styles.listenChantBtnText}>
                    {verseLang === "hi"
                      ? "श्लोक पाठ व भावार्थ सुनें"
                      : verseLang === "sa"
                      ? "पवित्र श्लोक पाठ सुनें"
                      : "Listen Sacred Chanting"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shuffleBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={handleNextVerse}
              activeOpacity={0.7}
            >
              <Shuffle size={14} color={colors.primary} />
              <Text style={[styles.shuffleBtnText, { color: colors.primary }]}>Next Shloka</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Vedic Wellness Pathways</Text>

        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.featureCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              onPress={feature.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                {feature.icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <RecentActivity />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 2,
  },
  omCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  omSymbol: {
    fontSize: 24,
    fontWeight: "bold",
  },
  quoteCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#B45309",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  quoteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  quoteBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  genderToggleGroup: {
    flexDirection: "row",
    borderRadius: 7,
    borderWidth: 1,
    padding: 2,
    gap: 2,
  },
  genderPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  genderPillText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  verseLangBar: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  verseLangTab: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  verseLangTabText: {
    fontSize: 11,
    fontWeight: "700",
  },
  sanskritBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  sanskritText: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 23,
    textAlign: "center",
  },
  quoteText: {
    fontSize: 13.5,
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: 8,
  },
  quoteSource: {
    fontSize: 11.5,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 14,
  },
  quoteBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  listenChantBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  listenChantBtnText: {
    color: "#fff",
    fontSize: 12.5,
    fontWeight: "700",
  },
  shuffleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  shuffleBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
  },
  featuresContainer: {
    flexDirection: "column",
    marginBottom: 24,
    gap: 12,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});
