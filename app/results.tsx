import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { useLanguage } from "@/context/language";
import { ExternalLink, Home, Music, Volume2, VolumeX, Radio, Sparkles, CheckCircle2, BookOpen, Activity, Globe } from "lucide-react-native";
import { NaturalVoiceAssistant } from "@/services/voiceAssistant";
import { supabase, getRandomMantraForEmotionType, getRandomSongForEmotionType } from "@/services/supabase";

type EmotionType = "negative" | "neutral" | "positive" | "very_positive";

const TRANSLATIONS = {
  en: {
    voiceGuidance: "AI Voice Guidance",
    maleMode: "Male Voice",
    femaleMode: "Female Voice",
    readFull: "Listen to Full AI Assessment",
    stopRead: "Stop Reading Full Analysis",
    langLabel: "Language / भाषा:",
    gunaTitle: "Tri-Guna Psychological Balance",
    sattvaLabel: "Sattva (Peace & Harmony)",
    rajasLabel: "Rajas (Passion & Energy)",
    tamasLabel: "Tamas (Inertia & Rest)",
    dominant: "Dominant",
    mantraLabel: "RECOMMENDED VEDIC MANTRA",
    listenChant: "Listen & Chant",
    stopChant: "Stop Chanting",
    benefitsTitle: "Therapeutic Meaning & Benefits",
    gitaWisdom: "Bhagavad Gita Wisdom",
    listenStory: "Listen to Reflection",
    stopStory: "Stop Narration",
    actionItems: "Daily Vedic Action Items",
    musicTherapy: "RECOMMENDED MUSIC THERAPY",
    listenYoutube: "Listen on YouTube",
    returnHome: "Return to Dashboard",
    wellnessAssessment: "Wellness Assessment",
    confidence: "Confidence",
    stressLevel: "Stress Level",
  },
  hi: {
    voiceGuidance: "वेदिक वाणी मार्गदर्शन",
    maleMode: "पुरुष वाणी",
    femaleMode: "स्त्री वाणी",
    readFull: "सम्पूर्ण विश्लेषण सुनें (Listen Full Diagnosis)",
    stopRead: "वाचन रोकें (Stop Reading)",
    langLabel: "भाषा / Language:",
    gunaTitle: "त्रिगुण मनोवैज्ञानिक संतुलन",
    sattvaLabel: "सत्त्व (शांति एवं सामंजस्य)",
    rajasLabel: "रजस् (उमंग एवं सक्रियता)",
    tamasLabel: "तमस् (विश्राम एवं निष्क्रियता)",
    dominant: "प्रमुख",
    mantraLabel: "अनुशंसित वैदिक मन्त्र",
    listenChant: "मन्त्र सुनें व जपें",
    stopChant: "जप रोकें",
    benefitsTitle: "चिकित्सीय अर्थ एवं लाभ",
    gitaWisdom: "श्रीमद्भगवद्गीता ज्ञान",
    listenStory: "गीता चिंतन सुनें",
    stopStory: "वाचन रोकें",
    actionItems: "दैनिक वैदिक कार्य-योजना",
    musicTherapy: "सुझावित संगीत चिकित्सा",
    listenYoutube: "यूट्यूब पर सुनें",
    returnHome: "मुख्य पृष्ठ पर लौटें",
    wellnessAssessment: "स्वास्थ्य विश्लेषण",
    confidence: "सटीकता",
    stressLevel: "तनाव स्तर",
  },
  sa: {
    voiceGuidance: "वैदिकवाणीमार्गदर्शनम्",
    maleMode: "पुरुषवाणी",
    femaleMode: "स्त्रीवाणी",
    readFull: "सम्पूर्णविश्लेषणस्य श्रवणम्",
    stopRead: "वाचनं स्थगयतु",
    langLabel: "भाषा (Language):",
    gunaTitle: "त्रिगुणमनोवैज्ञानिकसंतुलनम्",
    sattvaLabel: "सत्त्वम् (शान्तिः सामञ्जस्यं च)",
    rajasLabel: "रजः (क्रियाशीलता उत्साहः च)",
    tamasLabel: "तमः (विश्रामः जडता च)",
    dominant: "प्रमुखम्",
    mantraLabel: "अनुशंसितः वैदिकमन्त्रः",
    listenChant: "मन्त्रश्रवणं जपः च",
    stopChant: "जपं स्थगयतु",
    benefitsTitle: "आध्यात्मिकार्थः लाभाः च",
    gitaWisdom: "श्रीमद्भगवद्गीताज्ञानम्",
    listenStory: "गीताचिन्तनस्य श्रवणम्",
    stopStory: "वाचनं स्थगयतु",
    actionItems: "दैनिकवैदिककर्तव्यानि",
    musicTherapy: "संगीतचिकित्सा",
    listenYoutube: "यूट्यूब-श्रवणम्",
    returnHome: "मुख्यपृष्ठं प्रतिगच्छतु",
    wellnessAssessment: "आरोग्यविश्लेषणम्",
    confidence: "विश्वास्यता",
    stressLevel: "तनावस्तरः",
  },
};

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const { locale, setLocale } = useLanguage();

  // 3-Language state: en | hi | sa
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "sa">(
    locale === "hi" || locale === "sa" ? locale : "en"
  );

  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS.en;

  const [voiceGender, setVoiceGender] = useState<"male" | "female">("male");
  const [speaking, setSpeaking] = useState(false);
  const [speakingStory, setSpeakingStory] = useState(false);
  const [speakingFull, setSpeakingFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [story, setStory] = useState((params.story as string) || "");
  const [mantra, setMantra] = useState((params.mantra as string) || "");
  const [explanation, setExplanation] = useState((params.explanation as string) || "");
  const [song, setSong] = useState<{ title: string; url: string } | null>(null);

  const source = params.source as string;
  const headline = params.headline as string;
  const summary = params.summary as string;
  const chapter = params.chapter as string;
  const verse = params.verse as string;
  const sattva = params.sattva ? parseInt(params.sattva as string) : null;
  const rajas = params.rajas ? parseInt(params.rajas as string) : null;
  const tamas = params.tamas ? parseInt(params.tamas as string) : null;
  const dominantGuna = params.dominantGuna as string;
  const isAi = params.isAi === "true";

  const insights: string[] = (() => {
    try {
      return params.insights ? JSON.parse(params.insights as string) : [];
    } catch {
      return [];
    }
  })();

  const handleLanguageChange = (lang: "en" | "hi" | "sa") => {
    setSelectedLang(lang);
    setLocale(lang);
    NaturalVoiceAssistant.stop();
    setSpeaking(false);
    setSpeakingStory(false);
    setSpeakingFull(false);
  };

  useEffect(() => {
    if (loaded) return;

    const loadData = async () => {
      setLoading(true);
      try {
        let emotionType: EmotionType = "neutral";

        if (source === "questions") {
          const score = parseFloat(params.score as string) || 3;
          emotionType = getEmotionTypeFromScore(score);
        } else if (source === "face") {
          emotionType = (params.emotion as string)?.toLowerCase() as EmotionType || "neutral";
        } else if (source === "ecg") {
          emotionType = getEmotionTypeFromStressLevel(params.stressLevel as string);
        }

        if (!story) {
          const { data: storyData } = await supabase
            .from("stories")
            .select("*")
            .eq("emotion_type", emotionType)
            .limit(1);

          if (storyData && storyData.length > 0) {
            setStory(storyData[0].story_text);
          } else {
            setStory(getStoryForSource(source));
          }
        }

        if (!mantra) {
          const { data: mantraData, success } = await getRandomMantraForEmotionType(emotionType);
          if (success && mantraData?.text) {
            setMantra(mantraData.text);
            setExplanation(mantraData.explanation);
          } else {
            const fallback = getDefaultMantra(emotionType);
            setMantra(fallback.text);
            setExplanation(fallback.explanation);
          }
        }

        const { data: songData, success: songSuccess } = await getRandomSongForEmotionType(emotionType);
        if (songSuccess && songData?.title && songData?.url) {
          setSong({ title: songData.title, url: songData.url });
        } else {
          setSong({
            title: "Peaceful Meditation Music",
            url: "https://www.youtube.com/watch?v=lFcSrYw-ARY",
          });
        }
      } catch (err) {
        console.error("Error loading result data:", err);
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    };

    loadData();

    return () => {
      NaturalVoiceAssistant.stop();
      setSpeaking(false);
      setSpeakingStory(false);
      setSpeakingFull(false);
    };
  }, [source]);

  // Handle voice gender switch with instant audio preview
  const handleGenderSwitch = (newGender: "male" | "female") => {
    setVoiceGender(newGender);
    NaturalVoiceAssistant.stop();
    setSpeaking(false);
    setSpeakingStory(false);
    setSpeakingFull(false);

    // Instant audible preview of new voice
    const sampleText =
      selectedLang === "hi"
        ? newGender === "male"
          ? "नमस्ते! पुरुष आचार्य वाणी सक्रिय है।"
          : "नमस्ते! स्त्री आचार्या वाणी सक्रिय है।"
        : selectedLang === "sa"
        ? newGender === "male"
          ? "नमो नमः! आचार्यस्य वाणी सक्रियम् अस्ति।"
          : "नमो नमः! आचार्यायाः वाणी सक्रियम् अस्ति।"
        : newGender === "male"
        ? "Namaste! Male Acharya voice is now active."
        : "Namaste! Female Acharya voice is now active.";

    NaturalVoiceAssistant.speak(sampleText, selectedLang, newGender);
  };

  const speakFullAssessment = () => {
    if (speakingFull) {
      NaturalVoiceAssistant.stop();
      setSpeakingFull(false);
      return;
    }

    NaturalVoiceAssistant.stop();
    setSpeaking(false);
    setSpeakingStory(false);

    const titleText = getResultTitle();
    const gunaText =
      sattva !== null && rajas !== null && tamas !== null
        ? `${t.gunaTitle}: ${t.sattvaLabel} ${sattva}%, ${t.rajasLabel} ${rajas}%, ${t.tamasLabel} ${tamas}%. ${
            dominantGuna ? `${dominantGuna} ${t.dominant}.` : ""
          }`
        : "";
    const gitaText = chapter ? `${t.gitaWisdom} (${chapter}). ${verse ? `${verse}. ` : ""}${story}` : story;
    const mantraText = mantra ? `${t.mantraLabel}: ${mantra}. ${explanation}` : "";

    const fullText = `${titleText}. ${headline || ""}. ${summary || ""}. ${gunaText}. ${gitaText}. ${mantraText}`;

    NaturalVoiceAssistant.speak(
      fullText,
      selectedLang,
      voiceGender,
      () => setSpeakingFull(true),
      () => setSpeakingFull(false),
      () => setSpeakingFull(false)
    );
  };

  const speakMantra = () => {
    if (!mantra.trim()) return;

    if (speaking) {
      NaturalVoiceAssistant.stop();
      setSpeaking(false);
    } else {
      NaturalVoiceAssistant.stop();
      setSpeakingStory(false);
      setSpeakingFull(false);
      const mantraLang = NaturalVoiceAssistant.detectLanguage(mantra, "sa");
      NaturalVoiceAssistant.speak(
        mantra,
        mantraLang,
        voiceGender,
        () => setSpeaking(true),
        () => setSpeaking(false),
        () => setSpeaking(false)
      );
    }
  };

  const speakStory = () => {
    if (!story.trim()) return;

    if (speakingStory) {
      NaturalVoiceAssistant.stop();
      setSpeakingStory(false);
    } else {
      NaturalVoiceAssistant.stop();
      setSpeaking(false);
      setSpeakingFull(false);
      NaturalVoiceAssistant.speak(
        story,
        selectedLang,
        voiceGender,
        () => setSpeakingStory(true),
        () => setSpeakingStory(false),
        () => setSpeakingStory(false)
      );
    }
  };

  const openSongLink = async () => {
    if (!song?.url) return;
    const canOpen = await Linking.canOpenURL(song.url);
    if (canOpen) await Linking.openURL(song.url);
  };

  const getResultTitle = () => {
    switch (source) {
      case "questions":
        return `Emotional Score: ${params.score || "3.0"}/5.0`;
      case "face":
        return `${t.wellnessAssessment}: ${params.emotion}`;
      case "ecg":
        return `Heart Rate: ${params.heartRate} BPM`;
      default:
        return t.wellnessAssessment;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 3-Language Switcher Ribbon */}
        <View style={[styles.langBar, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Globe size={14} color={colors.primary} />
          <Text style={[styles.langBarLabel, { color: colors.textSecondary }]}>{t.langLabel}</Text>
          <View style={styles.langBtnGroup}>
            <TouchableOpacity
              style={[styles.langTabBtn, selectedLang === "en" && { backgroundColor: colors.primary }]}
              onPress={() => handleLanguageChange("en")}
            >
              <Text style={[styles.langTabBtnText, { color: selectedLang === "en" ? "#fff" : colors.text }]}>
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langTabBtn, selectedLang === "hi" && { backgroundColor: colors.primary }]}
              onPress={() => handleLanguageChange("hi")}
            >
              <Text style={[styles.langTabBtnText, { color: selectedLang === "hi" ? "#fff" : colors.text }]}>
                हिन्दी
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langTabBtn, selectedLang === "sa" && { backgroundColor: colors.primary }]}
              onPress={() => handleLanguageChange("sa")}
            >
              <Text style={[styles.langTabBtnText, { color: selectedLang === "sa" ? "#fff" : colors.text }]}>
                संस्कृतम्
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Natural AI Voice Control Banner */}
        <View
          style={[
            styles.voiceControlCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
        >
          <View style={styles.voiceControlLeft}>
            <View style={[styles.voiceAvatar, { backgroundColor: colors.primaryLight }]}>
              <Volume2 size={16} color={colors.primary} />
            </View>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.voiceControlTitle, { color: colors.text }]}>
                  {t.voiceGuidance}
                </Text>
                {speakingFull && (
                  <View style={styles.speakingWave}>
                    <Radio size={11} color="#16a34a" />
                    <Text style={styles.speakingWaveText}>Reading...</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.voiceControlSub, { color: colors.textSecondary }]}>
                {voiceGender === "male" ? t.maleMode : t.femaleMode} • {selectedLang.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Voice Gender Switcher Pills */}
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

        {/* Read Full Assessment Aloud Button */}
        <TouchableOpacity
          style={[
            styles.readFullBtn,
            { backgroundColor: speakingFull ? "#16a34a" : colors.primaryLight, borderColor: colors.primary },
          ]}
          onPress={speakFullAssessment}
        >
          {speakingFull ? (
            <VolumeX size={16} color="#fff" />
          ) : (
            <Volume2 size={16} color={colors.primary} />
          )}
          <Text
            style={[
              styles.readFullBtnText,
              { color: speakingFull ? "#fff" : colors.primary },
            ]}
          >
            {speakingFull ? t.stopRead : t.readFull}
          </Text>
        </TouchableOpacity>

        {/* Main Result Card */}
        <View style={[styles.resultCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.resultHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.resultTitle, { color: colors.text }]}>{getResultTitle()}</Text>
              <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
                {headline || (source === "face" ? `${t.confidence}: ${Number(params.confidence || 0) * 100}%` : `${t.stressLevel}: ${params.stressLevel || "Moderate"}`)}
              </Text>
            </View>
            <View style={[styles.aiBadge, { backgroundColor: colors.primaryLight }]}>
              <Sparkles size={14} color={colors.primary} />
              <Text style={[styles.aiBadgeText, { color: colors.primary }]}>
                {isAi ? "Gemini AI" : "Vedic Engine"}
              </Text>
            </View>
          </View>

          {summary ? (
            <Text style={[styles.summaryText, { color: colors.text }]}>{summary}</Text>
          ) : null}
        </View>

        {/* Guna Balance Profile Matrix (If available) */}
        {sattva !== null && rajas !== null && tamas !== null && (
          <View style={[styles.gunaCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.gunaHeaderRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Activity size={18} color={colors.primary} />
                <Text style={[styles.gunaTitle, { color: colors.text }]}>{t.gunaTitle}</Text>
              </View>
              {dominantGuna && (
                <Text style={[styles.dominantGunaTag, { backgroundColor: colors.primaryLight, color: colors.primary }]}>
                  {dominantGuna} {t.dominant}
                </Text>
              )}
            </View>

            {/* Sattva Meter */}
            <View style={styles.gunaMeterRow}>
              <View style={styles.gunaLabelRow}>
                <Text style={[styles.gunaLabel, { color: colors.text }]}>{t.sattvaLabel}</Text>
                <Text style={[styles.gunaPercent, { color: colors.primary }]}>{sattva}%</Text>
              </View>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${sattva}%`, backgroundColor: "#10b981" }]} />
              </View>
            </View>

            {/* Rajas Meter */}
            <View style={styles.gunaMeterRow}>
              <View style={styles.gunaLabelRow}>
                <Text style={[styles.gunaLabel, { color: colors.text }]}>{t.rajasLabel}</Text>
                <Text style={[styles.gunaPercent, { color: colors.primary }]}>{rajas}%</Text>
              </View>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${rajas}%`, backgroundColor: "#f59e0b" }]} />
              </View>
            </View>

            {/* Tamas Meter */}
            <View style={styles.gunaMeterRow}>
              <View style={styles.gunaLabelRow}>
                <Text style={[styles.gunaLabel, { color: colors.text }]}>{t.tamasLabel}</Text>
                <Text style={[styles.gunaPercent, { color: colors.primary }]}>{tamas}%</Text>
              </View>
              <View style={styles.meterTrack}>
                <View style={[styles.meterFill, { width: `${tamas}%`, backgroundColor: "#64748b" }]} />
              </View>
            </View>
          </View>
        )}

        {/* Recommended Mantra */}
        <View style={[styles.mantraCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.mantraLabel}>{t.mantraLabel}</Text>
          <Text style={styles.mantraText}>{mantra}</Text>
          <TouchableOpacity style={styles.speakButton} onPress={speakMantra}>
            <Volume2 size={16} color="#fff" />
            <Text style={styles.speakButtonText}>{speaking ? t.stopChant : t.listenChant}</Text>
          </TouchableOpacity>
        </View>

        {/* Mantra Meaning & Benefits */}
        <View style={[styles.explanationCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.explanationTitle, { color: colors.text }]}>{t.benefitsTitle}</Text>
          <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{explanation}</Text>
        </View>

        {/* Bhagavad Gita Wisdom */}
        <View style={[styles.storyCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.gitaHeaderRow}>
            <BookOpen size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
              {t.gitaWisdom} {chapter ? `(${chapter})` : ""}
            </Text>
          </View>

          {verse ? (
            <Text style={[styles.verseText, { color: colors.primary }]}>"{verse}"</Text>
          ) : null}

          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.storyText, { color: colors.text }]}>{story}</Text>
          )}

          <TouchableOpacity style={[styles.storyListenButton, { backgroundColor: colors.primaryLight }]} onPress={speakStory}>
            <Volume2 size={16} color={colors.primary} />
            <Text style={[styles.storyListenButtonText, { color: colors.primary }]}>
              {speakingStory ? t.stopStory : t.listenStory}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actionable Insights (If present) */}
        {insights.length > 0 && (
          <View style={[styles.insightsCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.insightsTitle, { color: colors.text }]}>{t.actionItems}</Text>
            {insights.map((insight, idx) => (
              <View key={idx} style={styles.insightItem}>
                <CheckCircle2 size={18} color="#10b981" style={{ marginTop: 2 }} />
                <Text style={[styles.insightText, { color: colors.text }]}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Music Therapy */}
        {song && (
          <View style={[styles.songCard, { backgroundColor: colors.primary }]}>
            <View style={styles.songHeaderRow}>
              <Music size={20} color="#fff" />
              <Text style={styles.songLabel}>{t.musicTherapy}</Text>
            </View>
            <Text style={styles.songTitle}>{song.title}</Text>
            <TouchableOpacity style={styles.songButton} onPress={openSongLink}>
              <ExternalLink size={16} color="#fff" />
              <Text style={styles.songButtonText}>{t.listenYoutube}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Return Home Button */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)")}
          >
            <Home size={20} color="#fff" />
            <Text style={styles.actionButtonText}>{t.returnHome}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getEmotionTypeFromScore(score: number): EmotionType {
  if (score <= 2) return "negative";
  if (score <= 3) return "neutral";
  if (score <= 4) return "positive";
  return "very_positive";
}

function getEmotionTypeFromStressLevel(level: string): EmotionType {
  switch (level?.toLowerCase()) {
    case "high":
      return "negative";
    case "moderate":
      return "neutral";
    case "low":
      return "positive";
    default:
      return "neutral";
  }
}

function getDefaultMantra(emotionType: EmotionType): { text: string; explanation: string } {
  switch (emotionType) {
    case "negative":
      return {
        text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
        explanation: "अपने कर्तव्य पर ध्यान दें, परिणामों पर नहीं। चिंता का समर्पण कर आत्म-शांति पाएं।",
      };
    case "neutral":
      return {
        text: "समत्वं योग उच्यते।",
        explanation: "समभाव ही योग है — जीवन की प्रत्येक परिस्थिति में मन को संतुलित रखें।",
      };
    case "positive":
      return {
        text: "सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ।",
        explanation: "सुख और दुःख, लाभ और हानि, जय और पराजय को समान जानकर कर्म करें।",
      };
    case "very_positive":
      return {
        text: "आनन्दो ब्रह्मेति व्यजानात्।",
        explanation: "आनंद ही परब्रह्म का स्वरूप है, स्वयं को दिव्य चेतना में स्थित करें।",
      };
  }
}

function getStoryForSource(source: string): string {
  switch (source) {
    case "questions":
      return "Arjuna once faced deep emotional distress on the battlefield. Lord Krishna reminded him that peace is found not by escaping action, but by anchoring the mind in selfless duty.";
    case "face":
      return "Facial expressions reflect our inner state of mind. By observing the mind without judgment, stillness naturally emerges.";
    case "ecg":
      return "The rhythm of the heart mirrors the mind. Through slow yogic breathing (Pranayama) and surrender, balance is restored.";
    default:
      return "True peace comes from balance, devotion, and detachment from fleeting outcomes.";
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  langBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  langBarLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  langBtnGroup: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  langTabBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  langTabBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  voiceControlCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceControlLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  voiceAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceControlTitle: {
    fontSize: 13,
    fontWeight: "bold",
  },
  voiceControlSub: {
    fontSize: 10,
    marginTop: 1,
  },
  speakingWave: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  speakingWaveText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#16a34a",
  },
  genderToggleGroup: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
    gap: 2,
  },
  genderPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  genderPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  readFullBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  readFullBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  resultCard: { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  resultHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  resultTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  resultSubtitle: { fontSize: 15, fontWeight: "500" },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14 },
  aiBadgeText: { fontSize: 11, fontWeight: "700" },
  summaryText: { marginTop: 14, fontSize: 15, lineHeight: 22 },
  gunaCard: { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  gunaHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  gunaTitle: { fontSize: 16, fontWeight: "bold" },
  dominantGunaTag: { fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  gunaMeterRow: { marginBottom: 12 },
  gunaLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  gunaLabel: { fontSize: 13, fontWeight: "500" },
  gunaPercent: { fontSize: 13, fontWeight: "700" },
  meterTrack: { height: 7, backgroundColor: "#e2e8f0", borderRadius: 4, overflow: "hidden" },
  meterFill: { height: "100%", borderRadius: 4 },
  mantraCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  mantraLabel: { color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginBottom: 8, opacity: 0.9 },
  mantraText: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 16, lineHeight: 26 },
  speakButton: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.25)", alignSelf: "flex-start" },
  speakButtonText: { color: "#fff", fontSize: 14, fontWeight: "600", marginLeft: 8 },
  explanationCard: { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  explanationTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  explanationText: { fontSize: 15, lineHeight: 23 },
  storyCard: { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  gitaHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  verseText: { fontSize: 14, fontStyle: "italic", fontWeight: "600", marginBottom: 10, lineHeight: 20 },
  storyText: { fontSize: 15, lineHeight: 23, marginBottom: 16 },
  storyListenButton: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, alignSelf: "flex-start", gap: 6 },
  storyListenButtonText: { fontSize: 13, fontWeight: "600" },
  insightsCard: { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  insightsTitle: { fontSize: 17, fontWeight: "700", marginBottom: 14 },
  insightItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  insightText: { fontSize: 14, lineHeight: 20, flex: 1 },
  songCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
  songHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  songLabel: { color: "#fff", fontSize: 11, fontWeight: "700", marginLeft: 6, letterSpacing: 0.8, opacity: 0.9 },
  songTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 14 },
  songButton: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.25)", alignSelf: "flex-start" },
  songButtonText: { color: "#fff", fontSize: 14, fontWeight: "600", marginLeft: 8 },
  actionsContainer: { marginBottom: 24 },
  actionButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 14 },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", marginLeft: 8 },
});