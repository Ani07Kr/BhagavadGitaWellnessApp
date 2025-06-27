import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/context/auth";
import { useTheme } from "@/context/theme";

export default function RecentActivity() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user?.id) return;

      const [res1, res2, res3] = await Promise.all([
        supabase.from("user_responses").select("created_at").eq("user_id", user.id),
        supabase.from("ecg_reports").select("created_at").eq("user_id", user.id),
        supabase.from("face_analysis").select("created_at").eq("user_id", user.id),
      ]);

      const labeled = [
        ...(res1.data?.map((item) => ({ ...item, type: "Assessment" })) || []),
        ...(res2.data?.map((item) => ({ ...item, type: "ECG Report" })) || []),
        ...(res3.data?.map((item) => ({ ...item, type: "Emotion Detection" })) || []),
      ];

      const sorted = labeled.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setActivity(sorted);
      setLoading(false);
    };

    fetchActivity();
  }, [user]);

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : activity.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            You haven't completed any assessments yet. Start your wellness journey by using one of the tools above.
          </Text>
        </View>
      ) : (
        activity.slice(0, 5).map((item, index) => (
          <View key={index} style={{ paddingVertical: 6 }}>
            <Text style={{ color: colors.text }}>
              • {item.type} on {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
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
