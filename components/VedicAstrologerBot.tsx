import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useTheme } from "@/context/theme";
import {
  Send,
  Sparkles,
  BookOpen,
  Volume2,
  VolumeX,
  CheckCircle2,
  Flame,
  Bot,
  User,
  Mic,
  MicOff,
  Globe,
  Radio,
} from "lucide-react-native";
import { KundliData } from "@/services/jyotishEngine";
import {
  VedicBotMessage,
  QUICK_VEDIC_TOPICS,
  askVedicBot,
} from "@/services/vedicBotEngine";
import { NaturalVoiceAssistant } from "@/services/voiceAssistant";

interface VedicAstrologerBotProps {
  kundli: KundliData;
  personName: string;
  language?: "en" | "hi" | "sa";
}

export default function VedicAstrologerBot({
  kundli,
  personName,
  language: initialLang = "en",
}: VedicAstrologerBotProps) {
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  // 3-Language State: English, Hindi, Sanskrit
  const [selectedLang, setSelectedLang] = useState<"en" | "hi" | "sa">(initialLang);
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("male");
  const [autoSpeak, setAutoSpeak] = useState(true);

  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Microphone Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

  const getWelcomeText = (lang: "en" | "hi" | "sa") => {
    if (lang === "hi") {
      return `नमस्ते ${personName}! मैं आपका वेदिक दैवज्ञ एवं भगवद्गीता मार्गदर्शक हूँ। आपकी कुण्डली (${kundli.lagna} लग्न, ${kundli.rashi} राशि) के अनुसार आप नौकरी (Job), विवाह (Marriage), धन (Money), स्वास्थ्य (Health) अथवा किसी भी समस्या पर प्रश्न पूछ सकते हैं। आप बोलकर भी पूछ सकते हैं! 🎙️`;
    }
    if (lang === "sa") {
      return `नमो नमः ${personName}! अहं भवतः ज्योतिषाचार्यः अस्मि। भवतः ${kundli.lagna} लग्नस्य कुण्डल्याधारेण कार्य-विवाह-धन-आरोग्यविषये यत्किमपि पृच्छतु। 🎙️`;
    }
    return `Namaste ${personName}! I am your Vedic Astrologer & Gita Counselor. Based on your chart (${kundli.lagna} Ascendant, ${kundli.rashi} Moon, ${kundli.nakshatra} Nakshatra), ask anything about your Job, Marriage, Finances, Health, or Life Obstacles. You can also tap the mic to speak! 🎙️`;
  };

  // Initial welcome message
  const [messages, setMessages] = useState<VedicBotMessage[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: getWelcomeText(selectedLang),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  // Handle language switch
  const handleLangSwitch = (lang: "en" | "hi" | "sa") => {
    setSelectedLang(lang);
    NaturalVoiceAssistant.stop();
    setSpeakingMsgId(null);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    NaturalVoiceAssistant.stop();
    setSpeakingMsgId(null);

    const userMsg: VedicBotMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setInterimTranscript("");
    setLoading(true);

    try {
      const botResponse = await askVedicBot(
        textToSend,
        kundli,
        personName,
        selectedLang,
        messages
      );
      setMessages((prev) => [...prev, botResponse]);

      // Auto-speak natural assistant voice if enabled
      if (autoSpeak) {
        speakBotMessage(botResponse);
      }
    } catch (err) {
      console.warn("Bot response error", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle voice gender switch with instant audio preview
  const handleGenderSwitch = (newGender: "male" | "female") => {
    setVoiceGender(newGender);
    NaturalVoiceAssistant.stop();
    setSpeakingMsgId(null);

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

  // Speak bot message with Natural Alexa/Siri style voice
  const speakBotMessage = (msg: VedicBotMessage, overrideGender?: "male" | "female") => {
    const genderToUse = overrideGender || voiceGender;
    if (speakingMsgId === msg.id) {
      NaturalVoiceAssistant.stop();
      setSpeakingMsgId(null);
      return;
    }

    const fullSpeechText = `${msg.text}. ${
      msg.gitaVerse
        ? `${selectedLang === "hi" ? "भगवद्गीता उपाय" : selectedLang === "sa" ? "गीता श्लोकः" : "Bhagavad Gita guidance"}: ${msg.gitaVerse.sanskrit}. ${msg.gitaVerse.translation}`
        : ""
    }`;

    NaturalVoiceAssistant.speak(
      fullSpeechText,
      selectedLang,
      genderToUse,
      () => setSpeakingMsgId(msg.id),
      () => setSpeakingMsgId(null),
      () => setSpeakingMsgId(null)
    );
  };

  // Toggle Microphone Listening (Free Speech-to-Text)
  const toggleVoiceInput = () => {
    if (isListening) {
      NaturalVoiceAssistant.stopListening();
      setIsListening(false);
      if (interimTranscript.trim()) {
        handleSend(interimTranscript);
      }
    } else {
      NaturalVoiceAssistant.stop();
      setSpeakingMsgId(null);
      setInterimTranscript("");

      const started = NaturalVoiceAssistant.startListening(selectedLang, {
        onStart: () => setIsListening(true),
        onResult: (text) => {
          setInterimTranscript(text);
          setInputQuery(text);
        },
        onError: (err) => {
          setIsListening(false);
        },
        onEnd: () => {
          setIsListening(false);
        },
      });

      if (!started) {
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      NaturalVoiceAssistant.stop();
      NaturalVoiceAssistant.stopListening();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      {/* Bot Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={[styles.botAvatar, { backgroundColor: colors.primaryLight }]}>
          <Bot size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Acharya AI (वेदिक दैवज्ञ)
            </Text>
            {speakingMsgId && (
              <View style={styles.speakingWave}>
                <Radio size={13} color="#16a34a" />
                <Text style={styles.speakingWaveText}>Speaking...</Text>
              </View>
            )}
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            AI Voice Counselor • Natural Voice Mode
          </Text>
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

      {/* 3-Language Switcher Ribbon */}
      <View style={[styles.langBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Globe size={13} color={colors.primary} />
        <Text style={[styles.langBarLabel, { color: colors.textSecondary }]}>Language / भाषा:</Text>
        <View style={styles.langBtnGroup}>
          <TouchableOpacity
            style={[styles.langTabBtn, selectedLang === "en" && { backgroundColor: colors.primary }]}
            onPress={() => handleLangSwitch("en")}
          >
            <Text style={[styles.langTabBtnText, { color: selectedLang === "en" ? "#fff" : colors.text }]}>
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langTabBtn, selectedLang === "hi" && { backgroundColor: colors.primary }]}
            onPress={() => handleLangSwitch("hi")}
          >
            <Text style={[styles.langTabBtnText, { color: selectedLang === "hi" ? "#fff" : colors.text }]}>
              हिन्दी (Hindi)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langTabBtn, selectedLang === "sa" && { backgroundColor: colors.primary }]}
            onPress={() => handleLangSwitch("sa")}
          >
            <Text style={[styles.langTabBtnText, { color: selectedLang === "sa" ? "#fff" : colors.text }]}>
              संस्कृतम् (Sanskrit)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auto-Voice Mute / Unmute Toggle */}
        <TouchableOpacity
          style={[styles.audioMuteBtn, { backgroundColor: autoSpeak ? colors.primaryLight : colors.border }]}
          onPress={() => setAutoSpeak(!autoSpeak)}
        >
          {autoSpeak ? <Volume2 size={13} color={colors.primary} /> : <VolumeX size={13} color={colors.textSecondary} />}
        </TouchableOpacity>
      </View>

      {/* Quick Topic Chips */}
      <View style={styles.topicsWrapper}>
        <Text style={[styles.topicsLabel, { color: colors.textSecondary }]}>
          {selectedLang === "hi"
            ? "शीघ्र प्रश्न स्पर्श करें (Tap to Ask):"
            : selectedLang === "sa"
            ? "शीघ्र प्रश्नाः:"
            : "Quick Questions (Tap to Ask):"}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsScroll}
        >
          {QUICK_VEDIC_TOPICS.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={[styles.topicChip, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() =>
                handleSend(
                  selectedLang === "hi"
                    ? topic.promptHi
                    : selectedLang === "sa"
                    ? topic.promptSa
                    : topic.prompt
                )
              }
              disabled={loading}
            >
              <Text style={[styles.topicChipText, { color: colors.primary }]}>
                {selectedLang === "hi" ? topic.labelHi : selectedLang === "sa" ? topic.labelSa : topic.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chat Messages Feed */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatFeed}
        contentContainerStyle={styles.chatFeedContent}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isCurrentlySpeaking = speakingMsgId === msg.id;

          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isUser ? styles.userRow : styles.botRow,
              ]}
            >
              {!isUser && (
                <View style={[styles.msgAvatar, { backgroundColor: colors.primaryLight }]}>
                  <Flame size={14} color={colors.primary} />
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  isUser
                    ? [styles.userBubble, { backgroundColor: colors.primary }]
                    : [
                        styles.botBubble,
                        { backgroundColor: colors.background, borderColor: isCurrentlySpeaking ? colors.primary : colors.border },
                        isCurrentlySpeaking && styles.activeSpeakingGlow,
                      ],
                ]}
              >
                {/* Main Message Text */}
                <Text
                  style={[
                    styles.messageText,
                    { color: isUser ? "#fff" : colors.text },
                  ]}
                >
                  {msg.text}
                </Text>

                {/* Astrological Insight Card */}
                {msg.astrologicalInsight && (
                  <View style={[styles.astrologyBox, { backgroundColor: colors.primaryLight }]}>
                    <Sparkles size={13} color={colors.primary} />
                    <Text style={[styles.astrologyText, { color: colors.primary }]}>
                      {msg.astrologicalInsight}
                    </Text>
                  </View>
                )}

                {/* Prescribed Gita Shloka */}
                {msg.gitaVerse && (
                  <View style={[styles.gitaCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <View style={styles.gitaTop}>
                      <BookOpen size={13} color={colors.primary} />
                      <Text style={[styles.gitaChapter, { color: colors.primary }]}>
                        Gita Remedy • {msg.gitaVerse.chapter}
                      </Text>
                    </View>
                    <Text style={[styles.gitaSanskrit, { color: colors.text }]}>
                      "{msg.gitaVerse.sanskrit}"
                    </Text>
                    <Text style={[styles.gitaMeaning, { color: colors.textSecondary }]}>
                      {msg.gitaVerse.translation}
                    </Text>
                  </View>
                )}

                {/* Vedic Remedies Check-List */}
                {msg.remedies && msg.remedies.length > 0 && (
                  <View style={styles.remediesList}>
                    <Text style={[styles.remediesHeader, { color: colors.primary }]}>
                      ✨ {selectedLang === "hi" ? "दैनिक वैदिक उपाय:" : selectedLang === "sa" ? "वैदिक उपायाः:" : "Prescribed Vedic Remedies:"}
                    </Text>
                    {msg.remedies.map((rem, rIdx) => (
                      <View key={rIdx} style={styles.remedyItem}>
                        <CheckCircle2 size={13} color="#10b981" style={{ marginTop: 2 }} />
                        <Text style={[styles.remedyText, { color: colors.text }]}>{rem}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Natural Speech Voice Playback Button */}
                {!isUser && (
                  <TouchableOpacity
                    style={[
                      styles.ttsBtn,
                      { backgroundColor: isCurrentlySpeaking ? "#16a34a" : colors.primaryLight },
                    ]}
                    onPress={() => speakBotMessage(msg)}
                  >
                    <Volume2 size={13} color={isCurrentlySpeaking ? "#fff" : colors.primary} />
                    <Text
                      style={[
                        styles.ttsBtnText,
                        { color: isCurrentlySpeaking ? "#fff" : colors.primary },
                      ]}
                    >
                      {isCurrentlySpeaking
                        ? "Stop Voice"
                        : selectedLang === "hi"
                        ? "आवाज में सुनें (Listen)"
                        : selectedLang === "sa"
                        ? "श्रवणम् (Listen)"
                        : "Listen in AI Voice"}
                    </Text>
                  </TouchableOpacity>
                )}

                <Text
                  style={[
                    styles.timeText,
                    { color: isUser ? "rgba(255,255,255,0.7)" : colors.textSecondary },
                  ]}
                >
                  {msg.timestamp}
                </Text>
              </View>

              {isUser && (
                <View style={[styles.msgAvatar, { backgroundColor: colors.primary }]}>
                  <User size={14} color="#fff" />
                </View>
              )}
            </View>
          );
        })}

        {loading && (
          <View style={[styles.messageRow, styles.botRow]}>
            <View style={[styles.msgAvatar, { backgroundColor: colors.primaryLight }]}>
              <Flame size={14} color={colors.primary} />
            </View>
            <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  Analyzing {personName}'s Kundli & synthesizing Natural Voice...
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Voice Listening Active Waveform Banner */}
      {isListening && (
        <View style={styles.listeningBanner}>
          <Mic size={16} color="#ef4444" />
          <Text style={styles.listeningText}>
            Listening to your voice... Speak your question ({selectedLang.toUpperCase()})
          </Text>
        </View>
      )}

      {/* Input Bar with Mic & Send */}
      <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {/* Interactive Microphone Button (Siri/Alexa-like Voice input) */}
        <TouchableOpacity
          style={[
            styles.micBtn,
            { backgroundColor: isListening ? "#ef4444" : colors.primaryLight },
          ]}
          onPress={toggleVoiceInput}
        >
          {isListening ? <MicOff size={16} color="#fff" /> : <Mic size={16} color={colors.primary} />}
        </TouchableOpacity>

        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={inputQuery}
          onChangeText={setInputQuery}
          placeholder={
            selectedLang === "hi"
              ? "प्रश्न लिखें अथवा बोलें (नौकरी, विवाह, धन...)"
              : selectedLang === "sa"
              ? "प्रश्नं लिखतु अथवा वदतु..."
              : "Type or speak question (job, marriage, wealth...)"
          }
          placeholderTextColor={colors.textSecondary}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: inputQuery.trim() ? colors.primary : colors.border },
          ]}
          onPress={() => handleSend()}
          disabled={!inputQuery.trim() || loading}
        >
          <Send size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  speakingWave: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
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
  langBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    gap: 6,
  },
  langBarLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  langBtnGroup: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  langTabBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langTabBtnText: {
    fontSize: 10,
    fontWeight: "700",
  },
  audioMuteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  topicsWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  topicsLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 6,
  },
  topicsScroll: {
    gap: 6,
  },
  topicChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  chatFeed: {
    maxHeight: 380,
  },
  chatFeedContent: {
    padding: 14,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  msgAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "84%",
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  botBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  activeSpeakingGlow: {
    borderColor: "#16a34a",
    borderWidth: 1.5,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  astrologyBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  astrologyText: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
    lineHeight: 16,
  },
  gitaCard: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  gitaTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  gitaChapter: {
    fontSize: 11,
    fontWeight: "700",
  },
  gitaSanskrit: {
    fontSize: 12,
    fontWeight: "700",
    fontStyle: "italic",
    marginBottom: 4,
  },
  gitaMeaning: {
    fontSize: 11,
    lineHeight: 16,
  },
  remediesList: {
    marginTop: 8,
    gap: 4,
  },
  remediesHeader: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  remedyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  remedyText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  ttsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  ttsBtnText: {
    fontSize: 10,
    fontWeight: "700",
  },
  timeText: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  listeningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fee2e2",
  },
  listeningText: {
    fontSize: 11,
    color: "#b91c1c",
    fontWeight: "700",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  micBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    maxHeight: 70,
    paddingVertical: 4,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
