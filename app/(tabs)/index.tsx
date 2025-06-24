import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";
import { Camera, FileText, Brain } from "lucide-react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [greeting, setGreeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const features = [
    {
      id: "questions",
      title: "Mental Assessment",
      description: "Answer questions to evaluate your emotional well-being",
      icon: <Brain size={24} color={colors.primary} />,
      onPress: () => router.push("/questions/1"),
    },
    {
      id: "face-detection",
      title: "Emotion Detection",
      description: "Analyze your facial expressions to detect emotions",
      icon: <Camera size={24} color={colors.primary} />,
      onPress: () => router.push("/face-detection"),
    },
    {
      id: "ecg-upload",
      title: "ECG Analysis",
      description: "Upload your ECG report for stress level analysis",
      icon: <FileText size={24} color={colors.primary} />,
      onPress: () => router.push("/ecg-upload"),
    },
  ];

  const quotes = [
    {
      text: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.",
      chapter: "Bhagavad Gita, Chapter 2, Verse 47",
    },
    {
      text: "The mind is restless and difficult to restrain, but it is subdued by practice.",
      chapter: "Bhagavad Gita, Chapter 6, Verse 35",
    },
    {
      text: "Whatever action is performed by a great man, common men follow in his footsteps.",
      chapter: "Bhagavad Gita, Chapter 3, Verse 21",
    },
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>{greeting}</Text>
            <Text style={[styles.name, { color: colors.text }]}>
              {user?.email ? user.email.split("@")[0] : "Guest"}
            </Text>
          </View>
        </View>

        <View style={[styles.quoteCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.quoteText, { color: colors.text }]}>"{randomQuote.text}"</Text>
          <Text style={[styles.quoteSource, { color: colors.textSecondary }]}>{randomQuote.chapter}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Wellness Tools</Text>
        
        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { backgroundColor: colors.cardBackground }]}
              onPress={feature.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.cardBackground }]}>
                {feature.icon}
              </View>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
              <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                {feature.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        
        <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            You haven't completed any assessments yet. Start your wellness journey by using one of the tools above.
          </Text>
        </View>
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "500",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  quoteCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: 12,
  },
  quoteSource: {
    fontSize: 14,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  featuresContainer: {
    flexDirection: "column",
    marginBottom: 24,
    gap: 12,
  },
  featureCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});