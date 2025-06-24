import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/context/auth";
import { ActivityIndicator } from "react-native";

interface Assessment {
  id: string;
  user_id: string;
  created_at: string;
  emotional_score?: number;
  recommended_mantra?: string;
  [key: string]: any;
}

interface Emotion {
  id: string;
  user_id: string;
  created_at: string;
  detected_emotion?: string;
  confidence?: number;
  [key: string]: any;
}

interface EcgReport {
  id: string;
  user_id: string;
  created_at: string;
  heart_rate?: number;
  stress_level?: string;
  file_type?: string;
  [key: string]: any;
}

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { user, displayName } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [ecgReports, setEcgReports] = useState<EcgReport[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user responses
        const { data: responseData, error: responseError } = await supabase
          .from("user_responses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (responseError) throw responseError;
        
        // Fetch face analysis
        const { data: faceData, error: faceError } = await supabase
          .from("face_analysis")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (faceError) throw faceError;
        
        // Fetch ECG reports
        const { data: ecgData, error: ecgError } = await supabase
          .from("ecg_reports")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (ecgError) throw ecgError;
        
        setAssessments(responseData || []);
        setEmotions(faceData || []);
        setEcgReports(ecgData || []);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading your progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasNoData = assessments.length === 0 && emotions.length === 0 && ecgReports.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {displayName ? `Hello, ${displayName}` : "Your Wellness Journey"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your progress over time
          </Text>
        </View>
        
        {hasNoData ? (
          <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No data yet</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              Complete assessments to track your progress over time. Your journey will be displayed here.
            </Text>
          </View>
        ) : (
          <>
            {assessments.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Mental Assessments</Text>
                {assessments.map((assessment, index) => (
                  <View 
                    key={assessment.id || index} 
                    style={[styles.card, { backgroundColor: colors.cardBackground }]}
                  >
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      Assessment on {new Date(assessment.created_at).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                      Emotional Score: {assessment.emotional_score || "N/A"}
                    </Text>
                    <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                      Recommended Mantra: {assessment.recommended_mantra || "None"}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {emotions.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Emotion Detection</Text>
                {emotions.map((emotion, index) => (
                  <View 
                    key={emotion.id || index} 
                    style={[styles.card, { backgroundColor: colors.cardBackground }]}
                  >
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      Analysis on {new Date(emotion.created_at).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                      Detected Emotion: {emotion.detected_emotion || "Unknown"}
                    </Text>
                    <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                      Confidence: {emotion.confidence ? `${Math.round(emotion.confidence * 100)}%` : "N/A"}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {ecgReports.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>ECG Reports</Text>
                {ecgReports.map((report, index) => (
                  <View 
                    key={report.id || index} 
                    style={[styles.card, { backgroundColor: colors.cardBackground }]}
                  >
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      Report on {new Date(report.created_at).toLocaleDateString()}
                    </Text>
                    <View style={styles.cardRow}>
                      <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                        Heart Rate: {report.heart_rate || "N/A"} BPM
                      </Text>
                      {report.file_type && (
                        <Text style={[styles.fileTypeTag, { 
                          backgroundColor: report.file_type === 'pdf' ? colors.secondary : colors.primary,
                        }]}>
                          {report.file_type.toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                      Stress Level: {report.stress_level || "Unknown"}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
  },
  fileTypeTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  emptyState: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});