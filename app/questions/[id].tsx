import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { supabase, getRandomQuestionsForAssessment, getRandomMantraForEmotionType } from "@/services/supabase";
import { ArrowRight, ArrowLeft } from "lucide-react-native";
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);
  const [responses, setResponses] = useState<ResponseMap>({});

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

  const handleOptionSelect = (option: QuestionOption) => {
    setSelectedOption(option);
  };

  const handleNext = async () => {
    if (!selectedOption || !currentQuestion) return;
    
    // Save response
    const newResponses = {
      ...responses,
      [currentQuestion.id]: selectedOption,
    };
    setResponses(newResponses);
    
    // Store responses in AsyncStorage
    await AsyncStorage.setItem('assessment_responses', JSON.stringify(newResponses));
    
    // If last question, submit all responses
    if (questionIndex >= questions.length - 1) {
      await submitResponses(newResponses);
      return;
    }
    
    // Go to next question
    router.push(`/questions/${questionIndex + 2}`); // +2 because we're using 1-based indexing in the URL
  };

  const handlePrevious = () => {
    if (questionIndex > 0) {
      router.push(`/questions/${questionIndex}`); // No need to add 1 here since we're going back
    }
  };

  const submitResponses = async (allResponses: ResponseMap) => {
    setSubmitting(true);
    try {
      // Calculate emotional score (simple average for demo)
      const values = Object.values(allResponses);
      const sum = values.reduce((acc, val) => acc + (val.value || 0), 0);
      const emotionalScore = Math.round((sum / values.length) * 10) / 10;
      
      // Get emotion type based on score
      const emotionType = getEmotionTypeFromScore(emotionalScore);
      
      // Get random mantra based on emotion type
      let mantra = { text: "", explanation: "" };
      
      try {
        const { data, success } = await getRandomMantraForEmotionType(emotionType);
        if (success && data) {
          mantra = { text: data.text, explanation: data.explanation };
        } else {
          // Fallback to default mantra
          mantra = getDefaultMantra(emotionType);
        }
      } catch (error) {
        console.error("Error getting mantra:", error);
        mantra = getDefaultMantra(emotionType);
      }
      
      // Save to Supabase
      if (user) {
        const { error } = await supabase.from("user_responses").insert({
          user_id: user.id,
          responses: allResponses,
          emotional_score: emotionalScore,
          recommended_mantra: mantra.text
        });
        
        if (error) throw error;
      }
      
      // Clear stored questions and responses
      await AsyncStorage.removeItem('assessment_questions');
      await AsyncStorage.removeItem('assessment_responses');
      
      // Navigate to results
      router.push({
        pathname: "/results",
        params: {
          source: "questions",
          score: emotionalScore,
          mantra: mantra.text,
          explanation: mantra.explanation
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Question {questionIndex + 1} of {questions.length}
          </Text>
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
        
        <Text style={[styles.questionText, { color: colors.text }]}>
          {currentQuestion.text}
        </Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                { 
                  backgroundColor: selectedOption?.id === option.id 
                    ? colors.primaryLight 
                    : colors.cardBackground 
                },
                selectedOption?.id === option.id && { borderColor: colors.primary, borderWidth: 2 }
              ]}
              onPress={() => handleOptionSelect(option)}
            >
              <Text 
                style={[
                  styles.optionText, 
                  { 
                    color: selectedOption?.id === option.id 
                      ? colors.primary 
                      : colors.text 
                  }
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: colors.cardBackground },
            questionIndex === 0 && { opacity: 0.5 }
          ]}
          onPress={handlePrevious}
          disabled={questionIndex === 0}
        >
          <ArrowLeft size={20} color={colors.text} />
          <Text style={[styles.navButtonText, { color: colors.text }]}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: selectedOption ? colors.primary : colors.cardBackground },
            !selectedOption && { opacity: 0.5 }
          ]}
          onPress={handleNext}
          disabled={!selectedOption || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text 
                style={[
                  styles.navButtonText, 
                  { color: selectedOption ? "#fff" : colors.text }
                ]}
              >
                {questionIndex >= questions.length - 1 ? "Submit" : "Next"}
              </Text>
              <ArrowRight size={20} color={selectedOption ? "#fff" : colors.text} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Helper function to get emotion type from score
function getEmotionTypeFromScore(score: number): string {
  if (score <= 2) return "negative";
  if (score <= 3) return "neutral";
  if (score <= 4) return "positive";
  return "very_positive";
}

// Helper function to get a default mantra if API fails
function getDefaultMantra(emotionType: string): { text: string; explanation: string } {
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
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 8,
  },
});