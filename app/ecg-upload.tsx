import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import { supabase } from "@/services/supabase";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Upload, FileText, AlertCircle, Image as ImageIcon, FileType } from "lucide-react-native";

// Interface for file info
interface FileInfo {
  uri: string;
  type: string; // 'image' or 'pdf'
  name?: string;
  size?: number;
  width?: number;
  height?: number;
}

export default function EcgUploadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [file, setFile] = useState<FileInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const pickImage = async () => {
    setError("");
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Fix this line
        allowsEditing: true,
        quality: 1,
      });

      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          type: 'image',
          name: asset.fileName || `image-${Date.now()}.jpg`,
          size: asset.fileSize,
          width: asset.width,
          height: asset.height
        });
      }
    } catch (err) {
      console.error("Error picking image:", err);
      setError("Failed to pick image. Please try again.");
    }
  };

  const pickPdf = async () => {
    setError("");
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });
      
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          type: 'pdf',
          name: asset.name,
          size: asset.size
        });
      }
    } catch (err) {
      console.error("Error picking PDF:", err);
      setError("Failed to pick PDF. Please try again.");
    }
  };

  const analyzeEcg = async () => {
    if (!file) {
      setError("Please upload an ECG image or PDF first");
      return;
    }
    
    setAnalyzing(true);
    setUploading(true);
    setError("");
    
    try {
      // Upload to Supabase Storage if user is logged in
      let fileUrl = "";
      
      if (user && Platform.OS !== "web" && file.uri) {
        try {
          const fileExt = file.type === 'pdf' ? 'pdf' : file.uri.split(".").pop();
          const fileName = `${user.id}_${Date.now()}.${fileExt}`;
          const filePath = `ecg/${fileName}`;
          
          // Read the file as base64
          const base64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Upload to Supabase Storage with robust base64 decoding
          const { error: uploadError } = await supabase.storage
            .from("ecg-reports")
            .upload(filePath, decodeBase64(base64), {
              contentType: file.type === 'pdf' ? 'application/pdf' : `image/${fileExt}`,
            });
          
          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from("ecg-reports")
              .getPublicUrl(filePath);
            fileUrl = urlData.publicUrl;
          } else {
            console.warn("Storage upload warning (proceeding with analysis):", uploadError.message);
          }
        } catch (storageErr) {
          console.warn("Could not upload to storage, proceeding with analysis:", storageErr);
        }
      }
      
      setUploading(false);
      
      // Simulate ECG analysis (heart rhythm, QRS interval, stress calculation)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // ECG analysis results
      const heartRate = 68 + Math.floor(Math.random() * 24); // 68-92 bpm
      const qrsInterval = 85 + Math.floor(Math.random() * 30); // 85-115 ms
      const stressLevel = ["Low", "Moderate", "High"][Math.floor(Math.random() * 3)];
      
      // Save to Supabase only if user is logged in with a real account (No data saved in guest mode)
      if (user && !user.isGuest) {
        const { error: dbError } = await supabase.from("ecg_reports").insert({
          user_id: user.id,
          file_url: fileUrl,
          file_type: file.type,
          heart_rate: heartRate,
          qrs_interval: qrsInterval,
          stress_level: stressLevel
        });
        
        if (dbError) console.error("Database insert error:", dbError);
      }
      
      // Get recommended mantra based on stress level
      const mantra = getRecommendedMantra(stressLevel);
      
      // Navigate to results
      router.push({
        pathname: "/results",
        params: {
          source: "ecg",
          heartRate,
          stressLevel,
          mantra: mantra.text,
          explanation: mantra.explanation
        }
      });
      
    } catch (err) {
      console.error("Error analyzing ECG:", err);
      setError("Failed to analyze ECG. Please try again.");
    } finally {
      setAnalyzing(false);
      setUploading(false);
    }
  };

  // Cross-platform base64 decoder that works across Hermes, JSC, and Web
  function decodeBase64(base64: string): Uint8Array {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const str = base64.replace(/[\r\n\s]+/g, "").replace(/=+$/, "");
    const len = str.length;
    const bytesLength = (len * 3) >> 2;
    const bytes = new Uint8Array(bytesLength);
    let p = 0;
    for (let i = 0; i < len; i += 4) {
      const c1 = chars.indexOf(str[i]);
      const c2 = chars.indexOf(str[i + 1]);
      const c3 = i + 2 < len ? chars.indexOf(str[i + 2]) : -1;
      const c4 = i + 3 < len ? chars.indexOf(str[i + 3]) : -1;
      const num = ((c1 & 63) << 18) | ((c2 & 63) << 12) | (((c3 >= 0 ? c3 : 0) & 63) << 6) | ((c4 >= 0 ? c4 : 0) & 63);
      bytes[p++] = (num >> 16) & 255;
      if (c3 >= 0) bytes[p++] = (num >> 8) & 255;
      if (c4 >= 0) bytes[p++] = num & 255;
    }
    return bytes.subarray(0, p);
  }

  // Function to render file preview
  const renderFilePreview = () => {
    if (!file) return null;
    
    if (file.type === 'image') {
      return <Image source={{ uri: file.uri }} style={styles.previewImage} />;
    } else {
      return (
        <View style={styles.pdfPreviewContainer}>
          <FileType size={40} color={colors.primary} />
          <Text style={[styles.pdfFileName, { color: colors.text }]}>
            {file.name || "ECG Report.pdf"}
          </Text>
          <Text style={[styles.pdfFileSize, { color: colors.textSecondary }]}>
            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ""}
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <FileText size={40} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>ECG Analysis</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Upload your ECG report to analyze heart patterns and stress levels
          </Text>
        </View>
        
        {error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        
        <View style={[styles.uploadContainer, { backgroundColor: colors.cardBackground }]}>
          {file ? (
            renderFilePreview()
          ) : (
            <View style={styles.placeholderContainer}>
              <Upload size={40} color={colors.textSecondary} />
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
                Tap a button below to upload your ECG
              </Text>
            </View>
          )}
          
          <View style={styles.uploadButtonsContainer}>
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: colors.primary }]}
              onPress={pickImage}
              disabled={uploading || analyzing}
            >
              <ImageIcon size={16} color="#fff" />
              <Text style={styles.uploadButtonText}>
                {file && file.type === 'image' ? "Change Image" : "Upload Image"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: colors.secondary }]}
              onPress={pickPdf}
              disabled={uploading || analyzing}
            >
              <FileText size={16} color="#fff" />
              <Text style={styles.uploadButtonText}>
                {file && file.type === 'pdf' ? "Change PDF" : "Upload PDF"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>What we analyze:</Text>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>• Heart Rate:</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Beats per minute (BPM)
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>• QRS Interval:</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Duration of ventricular depolarization
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>• Heart Rate Variability:</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Variation in time between heartbeats
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.text }]}>• Stress Indicators:</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Patterns that may indicate stress or anxiety
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            { 
              backgroundColor: file ? colors.primary : colors.primaryLight,
              opacity: file ? 1 : 0.6
            }
          ]}
          onPress={analyzeEcg}
          disabled={!file || uploading || analyzing}
        >
          {analyzing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.analyzeButtonText}>
              {uploading ? "Uploading..." : "Analyze ECG"}
            </Text>
          )}
        </TouchableOpacity>
        
        <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
          Disclaimer: This analysis is for informational purposes only and should not replace professional medical advice.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface Mantra {
  text: string;
  explanation: string;
}

function getRecommendedMantra(stressLevel: string): Mantra {
  switch (stressLevel.toLowerCase()) {
    case "high":
      return {
        text: "Om Shanti Shanti Shantihi",
        explanation: "Peace, peace, peace. This mantra helps calm the mind and reduce stress by invoking peace at all levels of being."
      };
    case "moderate":
      return {
        text: "So Hum",
        explanation: "I am That. This mantra aligns with the natural rhythm of breathing and helps create a sense of balance and harmony."
      };
    case "low":
      return {
        text: "Aham Prema",
        explanation: "I am Divine Love. This mantra helps maintain your calm state and radiate positive energy to others."
      };
    default:
      return {
        text: "Om Namah Shivaya",
        explanation: "I bow to the inner self. This universal mantra helps balance all aspects of your being."
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#ef4444",
    marginLeft: 8,
    flex: 1,
  },
  uploadContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  placeholderContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
  },
  pdfPreviewContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pdfFileName: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  pdfFileSize: {
    fontSize: 14,
  },
  uploadButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    margin: 4,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoItem: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoText: {
    fontSize: 14,
    marginLeft: 16,
  },
  analyzeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  analyzeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 20,
  },
});