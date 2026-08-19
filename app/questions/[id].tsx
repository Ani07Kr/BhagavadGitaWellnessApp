import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { supabase, getRandomQuestionsForAssessment, getRandomMantraForEmotionType, EmotionType } from "@/services/supabase";
import { analyzeMentalAssessmentWithAI, QuestionAnswer } from "@/services/aiWellness";
import { ChevronLeft, Volume2, VolumeX } from "lucide-react-native";
import { NaturalVoiceAssistant } from "@/services/voiceAssistant";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface QuestionOption {
  id: number;
  text: string;
  value: number;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
  category?: string;
}

interface ResponseMap {
  [key: string]: QuestionOption;
}

export default function QuestionScreen() {
  const { id } = useLocalSearchParams();
  const questionIndex = parseInt(id as string) - 1; // Convert to zero-based index
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [speakingQuestion, setSpeakingQuestion] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [responses, setResponses] = useState<ResponseMap>({});

  const toggleSpeakQuestion = () => {
    if (!currentQuestion) return;

    if (speakingQuestion) {
      NaturalVoiceAssistant.stop();
      setSpeakingQuestion(false);
    } else {
      const optionsText = currentQuestion.options.map((o, idx) => `Option ${idx + 1}: ${o.text}`).join(". ");
      const fullTextToSpeak = `${currentQuestion.text}. ${optionsText}`;
      NaturalVoiceAssistant.speak(
        fullTextToSpeak,
        "en",
        "male",
        () => setSpeakingQuestion(true),
        () => setSpeakingQuestion(false),
        () => setSpeakingQuestion(false)
      );
    }
  };

  useEffect(() => {
    return () => {
      NaturalVoiceAssistant.stop();
    };
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        // Check if we already have questions in AsyncStorage
        const storedQuestions = await AsyncStorage.getItem('assessment_questions');
        
        if (storedQuestions) {
          const parsedQuestions = JSON.parse(storedQuestions);
          setQuestions(parsedQuestions);
          setCurrentQuestion(parsedQuestions[questionIndex] || null);
        } else {
          // Fetch 10 random questions from Supabase
          const { data, error, success } = await getRandomQuestionsForAssessment(10);
          
          if (!success || error) {
            throw new Error("Failed to fetch questions");
          }
          
          // Parse options if they're stored as strings
          const parsedQuestions = data?.map((q: any) => ({
            ...q,
            options: typeof q.options === "string" ? JSON.parse(q.options) : q.options
          })) || [];
          
          // Store questions in AsyncStorage for this session
          await AsyncStorage.setItem('assessment_questions', JSON.stringify(parsedQuestions));
          
          setQuestions(parsedQuestions);
          setCurrentQuestion(parsedQuestions[questionIndex] || null);
        }
        
        // Load previous responses if any
        const storedResponses = await AsyncStorage.getItem('assessment_responses');
        if (storedResponses) {
          const parsedResponses = JSON.parse(storedResponses);
          setResponses(parsedResponses);
          
          // Set selected option if we have a response for this question
          if (currentQuestion && parsedResponses[currentQuestion.id]) {
            setSelectedOption(parsedResponses[currentQuestion.id]);
          }
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        // Use mock data as fallback
        const mockQuestions = getMockQuestions();
        // Only take 10 random questions from the mock data
        const randomMockQuestions = mockQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
        setQuestions(randomMockQuestions);
        setCurrentQuestion(randomMockQuestions[questionIndex] || null);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [questionIndex]);

  // Update selected option when current question changes
  useEffect(() => {
    if (currentQuestion && responses[currentQuestion.id]) {
      setSelectedOption(responses[currentQuestion.id]);
    } else {
      setSelectedOption(null);
    }
  }, [currentQuestion, responses]);

  const handleOptionSelect = async (option: QuestionOption) => {
    if (submitting || !currentQuestion) return;
    
    setSelectedOption(option);
    
    // Save response
    const newResponses = {
      ...responses,
      [currentQuestion.id]: option,
    };
    setResponses(newResponses);
    
    // Store responses in AsyncStorage
    await AsyncStorage.setItem('assessment_responses', JSON.stringify(newResponses));
    
    // Auto-advance with smooth micro-delay for visual feedback
    setTimeout(async () => {
      if (questionIndex >= questions.length - 1) {
        await submitResponses(newResponses);
      } else {
        router.push(`/questions/${questionIndex + 2}`); // +2 for 1-based indexing
      }
    }, 220);
  };

  const handleBack = () => {
    if (questionIndex > 0) {
      router.push(`/questions/${questionIndex}`);
    } else {
      router.push("/(tabs)");
    }
  };

  const submitResponses = async (allResponses: ResponseMap) => {
    setSubmitting(true);
    try {
      // Format answers for AI analysis
      const formattedAnswers: QuestionAnswer[] = questions.map((q) => ({
        questionId: q.id,
        questionText: q.text,
        category: q.category,
        selectedOption: allResponses[q.id] || { id: 0, text: "Neutral", value: 3 },
      }));

      // Analyze with Gemini AI / Vedic Guna Engine
      const aiAnalysis = await analyzeMentalAssessmentWithAI(formattedAnswers);

      // Save to Supabase only if user is logged in with a real account (No data saved in guest mode)
      if (user && !user.isGuest) {
        const { error: dbError } = await supabase.from("user_responses").insert({
          user_id: user.id,
          responses: allResponses,
          emotional_score: aiAnalysis.emotionalScore,
          recommended_mantra: aiAnalysis.mantra.text,
        });

        if (dbError) console.error("Database insert error:", dbError);
      }

      // Clear stored questions and responses
      await AsyncStorage.removeItem('assessment_questions');
      await AsyncStorage.removeItem('assessment_responses');

      // Navigate to results screen with rich AI & Guna profile data
      router.push({
        pathname: "/results",
        params: {
          source: "questions",
          score: aiAnalysis.emotionalScore.toFixed(1),
          emotion: aiAnalysis.emotionalState,
          headline: aiAnalysis.headline,
          summary: aiAnalysis.summary,
          mantra: aiAnalysis.mantra.text,
          explanation: aiAnalysis.mantra.explanation,
          chapter: aiAnalysis.gitaWisdom.chapter,
          verse: aiAnalysis.gitaWisdom.verse,
          story: aiAnalysis.gitaWisdom.reflection,
          sattva: aiAnalysis.gunaProfile.sattva.toString(),
          rajas: aiAnalysis.gunaProfile.rajas.toString(),
          tamas: aiAnalysis.gunaProfile.tamas.toString(),
          dominantGuna: aiAnalysis.gunaProfile.dominantGuna,
          insights: JSON.stringify(aiAnalysis.actionableInsights),
          isAi: aiAnalysis.isAiGenerated ? "true" : "false",
        }
      });
    } catch (error) {
      console.error("Error submitting responses:", error);
      Alert.alert(
        "Submission Error",
        "Failed to submit your responses. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.errorText, { color: colors.danger }]}>
            Question not found. Please try again.
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/questions/1")}
          >
            <Text style={styles.errorButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Top Navigation Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.cardBackground }]}
          onPress={handleBack}
          disabled={submitting}
        >
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.progressCountText, { color: colors.textSecondary }]}>
          {questionIndex + 1} / {questions.length}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  backgroundColor: colors.primary,
                  width: `${((questionIndex + 1) / questions.length) * 100}%` 
                }
              ]} 
            />
          </View>
        </View>
        
        {currentQuestion.category && (
          <Text style={[styles.categoryTag, { backgroundColor: colors.primaryLight, color: colors.primary }]}>
            {currentQuestion.category.toUpperCase()}
          </Text>
        )}
        
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <Text style={[styles.questionText, { color: colors.text, flex: 1 }]}>
            {currentQuestion.text}
          </Text>
          <TouchableOpacity
            style={[
              styles.speakQuestionBtn,
              { backgroundColor: speakingQuestion ? "#16a34a" : colors.primaryLight },
            ]}
            onPress={toggleSpeakQuestion}
          >
            {speakingQuestion ? (
              <VolumeX size={18} color="#fff" />
            ) : (
              <Volume2 size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOption?.id === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionButton,
                  { 
                    backgroundColor: isSelected 
                      ? colors.primaryLight 
                      : colors.cardBackground,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  }
                ]}
                onPress={() => handleOptionSelect(option)}
                disabled={submitting}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.optionText, 
                    { 
                      color: isSelected ? colors.primary : colors.text,
                      fontWeight: isSelected ? "700" : "500",
                    }
                  ]}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {submitting && (
          <View style={styles.submittingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.submittingText, { color: colors.textSecondary }]}>
              Calculating your wellness score...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to get emotion type from score
function getEmotionTypeFromScore(score: number): EmotionType {
  if (score <= 2) return "negative";
  if (score <= 3) return "neutral";
  if (score <= 4) return "positive";
  return "very_positive";
}

// Helper function to get a default mantra if API fails
function getDefaultMantra(emotionType: EmotionType): { text: string; explanation: string } {
  switch (emotionType) {
    case "negative":
      return {
        text: "Karmanye vadhikaraste Ma Phaleshu Kadachana",
        explanation: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Focus on your efforts, not the outcomes."
      };
    case "neutral":
      return {
        text: "Samatvam yoga uchyate",
        explanation: "Equanimity is called yoga. Maintain balance in both pleasure and pain, success and failure."
      };
    case "positive":
      return {
        text: "Sukha-duhkhe same kritva labhalabhau jayajayau",
        explanation: "Be steadfast and treat happiness and distress, gain and loss, victory and defeat with equanimity."
      };
    case "very_positive":
      return {
        text: "Ananda Hum",
        explanation: "I am Bliss. This mantra affirms your inherent nature as pure joy and bliss."
      };
    default:
      return {
        text: "Om Shanti Shanti Shantihi",
        explanation: "Peace, peace, peace. This mantra helps calm the mind and reduce stress by invoking peace at all levels of being."
      };
  }
}

// Mock data for when Supabase is not available
function getMockQuestions(): Question[] {
  return [
    {
      id: 1,
      text: "How would you describe your overall mood today?",
      category: "emotional",
      options: [
        { id: 1, text: "Very negative", value: 1 },
        { id: 2, text: "Somewhat negative", value: 2 },
        { id: 3, text: "Neutral", value: 3 },
        { id: 4, text: "Somewhat positive", value: 4 },
        { id: 5, text: "Very positive", value: 5 }
      ]
    },
    {
      id: 2,
      text: "How well did you sleep last night?",
      category: "physical",
      options: [
        { id: 1, text: "Very poorly", value: 1 },
        { id: 2, text: "Poorly", value: 2 },
        { id: 3, text: "Average", value: 3 },
        { id: 4, text: "Well", value: 4 },
        { id: 5, text: "Very well", value: 5 }
      ]
    },
    {
      id: 3,
      text: "How would you rate your stress level?",
      category: "emotional",
      options: [
        { id: 1, text: "Extremely high", value: 1 },
        { id: 2, text: "High", value: 2 },
        { id: 3, text: "Moderate", value: 3 },
        { id: 4, text: "Low", value: 4 },
        { id: 5, text: "Very low", value: 5 }
      ]
    },
    {
      id: 4,
      text: "How connected do you feel to others today?",
      category: "social",
      options: [
        { id: 1, text: "Not at all", value: 1 },
        { id: 2, text: "Slightly", value: 2 },
        { id: 3, text: "Moderately", value: 3 },
        { id: 4, text: "Very", value: 4 },
        { id: 5, text: "Extremely", value: 5 }
      ]
    },
    {
      id: 5,
      text: "How satisfied are you with your life right now?",
      category: "emotional",
      options: [
        { id: 1, text: "Very dissatisfied", value: 1 },
        { id: 2, text: "Somewhat dissatisfied", value: 2 },
        { id: 3, text: "Neutral", value: 3 },
        { id: 4, text: "Somewhat satisfied", value: 4 },
        { id: 5, text: "Very satisfied", value: 5 }
      ]
    },
    {
      id: 6,
      text: "How often do you feel overwhelmed by your emotions?",
      category: "emotional",
      options: [
        { id: 1, text: "Almost always", value: 1 },
        { id: 2, text: "Often", value: 2 },
        { id: 3, text: "Sometimes", value: 3 },
        { id: 4, text: "Rarely", value: 4 },
        { id: 5, text: "Almost never", value: 5 }
      ]
    },
    {
      id: 7,
      text: "How well can you identify what you are feeling?",
      category: "emotional",
      options: [
        { id: 1, text: "Very poorly", value: 1 },
        { id: 2, text: "Poorly", value: 2 },
        { id: 3, text: "Moderately well", value: 3 },
        { id: 4, text: "Well", value: 4 },
        { id: 5, text: "Very well", value: 5 }
      ]
    },
    {
      id: 8,
      text: "How often do you experience joy in your daily life?",
      category: "emotional",
      options: [
        { id: 1, text: "Almost never", value: 1 },
        { id: 2, text: "Rarely", value: 2 },
        { id: 3, text: "Sometimes", value: 3 },
        { id: 4, text: "Often", value: 4 },
        { id: 5, text: "Almost always", value: 5 }
      ]
    },
    {
      id: 9,
      text: "How well do you manage negative emotions?",
      category: "emotional",
      options: [
        { id: 1, text: "Very poorly", value: 1 },
        { id: 2, text: "Poorly", value: 2 },
        { id: 3, text: "Moderately well", value: 3 },
        { id: 4, text: "Well", value: 4 },
        { id: 5, text: "Very well", value: 5 }
      ]
    },
    {
      id: 10,
      text: "How often do you feel a sense of purpose in your life?",
      category: "spiritual",
      options: [
        { id: 1, text: "Almost never", value: 1 },
        { id: 2, text: "Rarely", value: 2 },
        { id: 3, text: "Sometimes", value: 3 },
        { id: 4, text: "Often", value: 4 },
        { id: 5, text: "Almost always", value: 5 }
      ]
    },
    {
      id: 11,
      text: "How would you rate your physical health today?",
      category: "physical",
      options: [
        { id: 1, text: "Very poor", value: 1 },
        { id: 2, text: "Poor", value: 2 },
        { id: 3, text: "Average", value: 3 },
        { id: 4, text: "Good", value: 4 },
        { id: 5, text: "Excellent", value: 5 }
      ]
    },
    {
      id: 12,
      text: "How energetic do you feel today?",
      category: "physical",
      options: [
        { id: 1, text: "Not at all energetic", value: 1 },
        { id: 2, text: "Slightly energetic", value: 2 },
        { id: 3, text: "Moderately energetic", value: 3 },
        { id: 4, text: "Very energetic", value: 4 },
        { id: 5, text: "Extremely energetic", value: 5 }
      ]
    },
    {
      id: 13,
      text: "How often do you practice detachment from outcomes?",
      category: "gita",
      options: [
        { id: 1, text: "Almost never", value: 1 },
        { id: 2, text: "Rarely", value: 2 },
        { id: 3, text: "Sometimes", value: 3 },
        { id: 4, text: "Often", value: 4 },
        { id: 5, text: "Almost always", value: 5 }
      ]
    },
    {
      id: 14,
      text: "How well do you maintain equanimity in difficult situations?",
      category: "gita",
      options: [
        { id: 1, text: "Very poorly", value: 1 },
        { id: 2, text: "Poorly", value: 2 },
        { id: 3, text: "Moderately well", value: 3 },
        { id: 4, text: "Well", value: 4 },
        { id: 5, text: "Very well", value: 5 }
      ]
    },
    {
      id: 15,
      text: "How connected do you feel to your dharma (purpose)?",
      category: "gita",
      options: [
        { id: 1, text: "Not at all connected", value: 1 },
        { id: 2, text: "Slightly connected", value: 2 },
        { id: 3, text: "Moderately connected", value: 3 },
        { id: 4, text: "Very connected", value: 4 },
        { id: 5, text: "Extremely connected", value: 5 }
      ]
    }
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
    fontSize: 12,
    fontWeight: "600",
  },
  questionText: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 24,
    lineHeight: 30,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  progressCountText: {
    fontSize: 15,
    fontWeight: "600",
  },
  submittingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    paddingVertical: 14,
  },
  submittingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  speakQuestionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});