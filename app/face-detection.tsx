import { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { supabase } from "@/services/supabase";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Camera, RefreshCw } from "lucide-react-native";

interface EmotionResult {
  emotion: string;
  confidence: number;
}

export default function FaceDetectionScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("front");
  const [analyzing, setAnalyzing] = useState(false);
  const [emotion, setEmotion] = useState<EmotionResult | null>(null);
  const [error, setError] = useState("");
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const toggleCameraFacing = () => {
    setFacing((current: CameraType) => (current === "back" ? "front" : "back"));
  };

  const captureAndAnalyze = async () => {
    if (analyzing) return;

    setAnalyzing(true);
    setError("");
    setEmotion(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });

      const formData = new FormData();
      formData.append("image_base64", photo.base64);
      formData.append("api_key", "KY5qPFm-Wsb6-OvwukIbTlO0pMUoA90B");
      formData.append("api_secret", "syFWIlUw89StgUAuchjD_PDRumn-ULoT");
      formData.append("return_attributes", "emotion");

      const response = await fetch("https://api-us.faceplusplus.com/facepp/v3/detect", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.faces || result.faces.length === 0) {
        throw new Error("No face detected. Try again with better lighting.");
      }

      const rawEmotions = result.faces[0]?.attributes?.emotion;

      const emotionMap: { [key: string]: string } = {
        happiness: "happy",
        sadness: "sad",
        neutral: "neutral",
        surprise: "surprised",
        anger: "angry",
      };

      const filtered = Object.entries(rawEmotions)
        .filter(([key]) => Object.keys(emotionMap).includes(key))
        .map(([key, value]) => [emotionMap[key], value] as [string, number]);

      const topEmotion = filtered.reduce((max, curr) => (curr[1] > max[1] ? curr : max));

      const detectedEmotion: EmotionResult = {
        emotion: topEmotion[0],
        confidence: topEmotion[1] / 100,
      };

      setEmotion(detectedEmotion);

      if (user) {
        const { error } = await supabase.from("face_analysis").insert({
          user_id: user.id,
          detected_emotion: detectedEmotion.emotion,
          confidence: detectedEmotion.confidence,
        });

        if (error) throw error;
      }

      const mantra = getRecommendedMantra(detectedEmotion.emotion);

      setTimeout(() => {
        router.push({
          pathname: "/results",
          params: {
            source: "face",
            emotion: detectedEmotion.emotion,
            confidence: detectedEmotion.confidence.toFixed(2),
            mantra: mantra.text,
            explanation: mantra.explanation,
          },
        });
      }, 1500);
    } catch (err) {
      console.error("Error analyzing face:", err);
      setError("Failed to analyze facial expression. Try again with proper lighting.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.messageContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.messageContainer}>
          <Camera size={48} color={colors.primary} />
          <Text style={[styles.messageTitle, { color: colors.text }]}>Camera Permission Required</Text>
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>
            We need camera access to detect your facial expressions and provide personalized recommendations.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <View style={styles.cameraContainer}>
        {Platform.OS !== "web" ? (
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            {emotion && (
              <View style={styles.emotionOverlay}>
                <Text style={styles.emotionText}>Detected: {emotion.emotion.toUpperCase()}</Text>
                <Text style={styles.confidenceText}>
                  Confidence: {Math.round(emotion.confidence * 100)}%
                </Text>
              </View>
            )}
          </CameraView>
        ) : (
          <View style={[styles.webFallback, { backgroundColor: "#000" }]}>
            <Text style={styles.webFallbackText}>
              Camera preview not available on web. Click the button below to simulate emotion detection.
            </Text>
          </View>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.cardBackground }]}
          onPress={toggleCameraFacing}
          disabled={analyzing || Platform.OS === "web"}
        >
          <RefreshCw size={24} color={colors.text} />
          <Text style={[styles.controlText, { color: colors.text }]}>Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.captureButton,
            { backgroundColor: analyzing ? colors.primaryLight : colors.primary },
          ]}
          onPress={captureAndAnalyze}
          disabled={analyzing}
        >
          {analyzing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.captureButtonText}>
              {Platform.OS === "web" ? "Simulate Detection" : "Detect Emotion"}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />
      </View>

      <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
        Position your face in the frame and ensure good lighting for best results
      </Text>
    </SafeAreaView>
  );
}

interface Mantra {
  text: string;
  explanation: string;
}

function getRecommendedMantra(emotion: string): Mantra {
  switch (emotion.toLowerCase()) {
    case "happy":
      return {
        text: "Ananda brahma, ananda brahma, ananda hi brahma",
        explanation: "Bliss is divine, bliss is divine, bliss indeed is divine. Maintain this joyful state and share it with others.",
      };
    case "sad":
      return {
        text: "Tat tvam asi",
        explanation: "You are that. Remember your divine nature beyond temporary emotions and find comfort in your true self.",
      };
    case "angry":
      return {
        text: "Shanti, shanti, shantihi",
        explanation: "Peace, peace, peace. Let go of anger and find the peace that resides within you.",
      };
    case "surprised":
      return {
        text: "Prajnanam brahma",
        explanation: "Consciousness is the ultimate reality. Stay grounded in awareness as you process new experiences.",
      };
    case "neutral":
      return {
        text: "Aham brahmasmi",
        explanation: "I am the absolute reality. Recognize the divine consciousness within you.",
      };
    default:
      return {
        text: "Om shanti shanti shantihi",
        explanation: "Peace in body, mind, and spirit. Find balance in all aspects of your being.",
      };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 12,
    margin: 16,
  },
  camera: { flex: 1 },
  webFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  webFallbackText: {
    color: "#fff",
    textAlign: "center",
    padding: 20,
    fontSize: 16,
  },
  emotionOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
    alignItems: "center",
  },
  emotionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  confidenceText: { color: "#fff", fontSize: 14 },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  controlButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 80,
  },
  controlText: { marginTop: 4, fontSize: 12 },
  captureButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  captureButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  spacer: { width: 80 },
  instructionText: {
    textAlign: "center",
    fontSize: 14,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  messageText: { fontSize: 16, textAlign: "center", marginBottom: 24 },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: { color: "#ef4444", textAlign: "center" },
});
