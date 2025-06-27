import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { ExternalLink, Home, Music, Volume2 } from "lucide-react-native";
import * as Speech from "expo-speech";
import { supabase, getRandomMantraForEmotionType, getRandomSongForEmotionType } from "@/services/supabase";

type EmotionType = "negative" | "neutral" | "positive" | "very_positive";

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  const [speaking, setSpeaking] = useState(false);
  const [speakingStory, setSpeakingStory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [story, setStory] = useState("");
  const [mantra, setMantra] = useState(params.mantra as string || "");
  const [explanation, setExplanation] = useState(params.explanation as string || "");
  const [song, setSong] = useState<{ title: string; url: string } | null>(null);

  const source = params.source as string;

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

        if (!params.mantra) {
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
            url: "https://www.youtube.com/watch?v=lFcSrYw-ARY"
          });
        }

        // ✅ Fetch user from Supabase Auth and send result email
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (user && !userError && user.email) {
          const email = user.email;
          const name = user.user_metadata?.full_name || "User";
          const result = getResultTitle();

          try {
            const response = await fetch("https://api.resend.com/emails", {
                 method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": 'Bearer re_16SqDREq_3rL2gS3UreituymhKMijzxpi' // for Expo apps
                },
              body: JSON.stringify({
                email,
                name,
                result,
                from: "onboarding@resend.dev",
                to: email,  // You can also replace with a test email like "you@example.com"
                subject: "Your Emotional Result",
                html: `
                      <div style="font-family: sans-serif; line-height: 1.5;">
                        <h2>Namaste ${name} 🌸</h2>
                        <p><strong>Result Summary:</strong><br/>${getResultTitle()}</p>
                        <p><strong>Details:</strong><br/>${getResultSubtitle()}</p>
                        <hr/>
                        <h3>🕉️ Recommended Mantra</h3>
                        <p><strong>${mantra}</strong></p>
                        <p>${explanation}</p>
                        <hr/>
                        <h3>🎵 Recommended Song</h3>
                        <p><strong>${song?.title}</strong></p>
                        <p><a href="${song?.url}">${song?.url}</a></p>
                        <hr/>
                        <h3>📖 Wisdom from the Bhagavad Gita</h3>
                        <p>${story}</p>
                        <hr/>
                        <p>🧘 Stay balanced, stay peaceful.</p>
                        <p>— Bhagavad Gita Wellness App</p>
                      </div>
                    `
                  }),
                });

            if (response.ok) {
              console.log("✅ Email sent to", email);
            } else {
              const errorMsg = await response.text();
              console.error("❌ Email sending failed:", errorMsg);
            }
          } catch (err) {
            console.error("❌ Error sending email:", err);
          }
        } else {
          console.warn("⚠️ Email not found or user not logged in");
        }

      } catch (err) {
        console.error("Error loading data:", err);
        setStory(getStoryForSource(source));
        setSong({
          title: "Peaceful Meditation Music",
          url: "https://www.youtube.com/watch?v=lFcSrYw-ARY"
        });
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    };

    loadData();

    return () => {
      Speech.stop();
      setSpeaking(false);
      setSpeakingStory(false);
    };
  }, [source]);

  const speakMantra = () => {
    if (Platform.OS === "web") return alert("Speech not supported on web");
    if (!mantra.trim()) return;

    if (speaking) {
      Speech.stop();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      Speech.speak(mantra, {
        language: "en",
        pitch: 1.0,
        rate: 0.75,
        onDone: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }
  };

  const speakStory = () => {
    if (Platform.OS === "web") return alert("Speech not supported on web");
    if (!story.trim()) return;

    if (speakingStory) {
      Speech.stop();
      setSpeakingStory(false);
    } else {
      setSpeakingStory(true);
      Speech.speak(story, {
        language: "en",
        pitch: 1.0,
        rate: 0.75,
        onDone: () => setSpeakingStory(false),
        onError: () => setSpeakingStory(false),
      });
    }
  };

  const openSongLink = async () => {
    if (!song?.url) return;
    const canOpen = await Linking.canOpenURL(song.url);
    if (canOpen) await Linking.openURL(song.url);
  };

  const getResultTitle = () => {
    switch (source) {
      case "questions": return `Emotional Score: ${params.score}/5`;
      case "face": return `Detected Emotion: ${params.emotion}`;
      case "ecg": return `Heart Rate: ${params.heartRate} BPM`;
      default: return "Your Results";
    }
  };

  const getResultSubtitle = () => {
    switch (source) {
      case "questions": return "Based on your responses";
      case "face": return `Confidence: ${Number(params.confidence || 0) * 100}%`;
      case "ecg": return `Stress Level: ${params.stressLevel}`;
      default: return "";
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.resultCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>{getResultTitle()}</Text>
          <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>{getResultSubtitle()}</Text>
        </View>

        <View style={[styles.mantraCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.mantraLabel}>RECOMMENDED MANTRA</Text>
          <Text style={styles.mantraText}>{mantra}</Text>
          <TouchableOpacity style={styles.speakButton} onPress={speakMantra}>
            <Volume2 size={16} color="#fff" />
            <Text style={styles.speakButtonText}>{speaking ? "Stop" : "Listen"}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.explanationCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.explanationTitle, { color: colors.text }]}>Meaning & Benefits</Text>
          <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{explanation}</Text>
        </View>

        {song && (
          <View style={[styles.songCard, { backgroundColor: colors.primary }]}>
            <View style={styles.songHeaderRow}>
              <Music size={20} color="#fff" />
              <Text style={styles.songLabel}>RECOMMENDED MUSIC</Text>
            </View>
            <Text style={styles.songTitle}>{song.title}</Text>
            <TouchableOpacity style={styles.songButton} onPress={openSongLink}>
              <ExternalLink size={16} color="#fff" />
              <Text style={styles.songButtonText}>Listen on YouTube</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Bhagavad Gita Wisdom</Text>

        {loading ? (
          <View style={[styles.loadingContainer, { backgroundColor: colors.cardBackground }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading wisdom...</Text>
          </View>
        ) : (
          <View style={[styles.storyCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.storyText, { color: colors.text }]}>{story}</Text>
            <TouchableOpacity style={styles.storyListenButton} onPress={speakStory}>
              <Volume2 size={16} color="#fff" />
              <Text style={styles.storyListenButtonText}>{speakingStory ? "Stop" : "Listen to Wisdom"}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)")}
          >
            <Home size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Return Home</Text>
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
    case "high": return "negative";
    case "moderate": return "neutral";
    case "low": return "positive";
    default: return "neutral";
  }
}

function getDefaultMantra(emotionType: EmotionType): { text: string; explanation: string } {
  switch (emotionType) {
    case "negative":
      return {
        text: "Karmanye vadhikaraste Ma Phaleshu Kadachana",
        explanation: "Focus on your duties, not the outcomes.",
      };
    case "neutral":
      return {
        text: "Samatvam yoga uchyate",
        explanation: "Balance is yoga — stay calm in all situations.",
      };
    case "positive":
      return {
        text: "Sukha-duhkhe same kritva labhalabhau jayajayau",
        explanation: "Treat gain and loss, success and failure equally.",
      };
    case "very_positive":
      return {
        text: "Ananda Hum",
        explanation: "I am pure bliss.",
      };
  }
}

function getStoryForSource(source: string): string {
  switch (source) {
    case "questions":
      return "Arjuna once faced emotional conflict on the battlefield. Krishna reminded him of his duty.";
    case "face":
      return "Expressions reflect our inner state. Cultivate calmness through self-awareness.";
    case "ecg":
      return "Heart rhythm mirrors the mind. Pranayama and meditation help restore balance.";
    default:
      return "True peace comes from balance and detachment from outcomes.";
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  resultCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  resultTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  resultSubtitle: { fontSize: 16 },
  mantraCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  mantraLabel: { color: "#fff", fontSize: 12, fontWeight: "600", marginBottom: 8 },
  mantraText: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  speakButton: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)" },
  speakButtonText: { color: "#fff", fontSize: 14, fontWeight: "600", marginLeft: 8 },
  explanationCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
  explanationTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  explanationText: { fontSize: 16, lineHeight: 24 },
  songCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
  songHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  songLabel: { color: "#fff", fontSize: 12, fontWeight: "600", marginLeft: 6 },
  songTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  songButton: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)" },
  songButtonText: { color: "#fff", fontSize: 14, fontWeight: "600", marginLeft: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  loadingContainer: { padding: 40, alignItems: "center", borderRadius: 16 },
  loadingText: { marginTop: 12, fontSize: 16 },
  storyCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
  storyText: { fontSize: 16, lineHeight: 24, marginBottom: 16 },
  storyListenButton: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 12, backgroundColor: "#3b82f6" },
  storyListenButtonText: { color: "#fff", fontSize: 14, fontWeight: "600", marginLeft: 8 },
  actionsContainer: { marginBottom: 20 },
  actionButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, borderRadius: 12 },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
});