import { Platform } from "react-native";
import * as Speech from "expo-speech";

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

// English to Hindi/Sanskrit Planet and Terminology Mappings for pure pronunciation
const ENGLISH_TO_HINDI_TERMS: { [key: string]: string } = {
  "Sun": "सूर्यदेव",
  "Moon": "चन्द्रदेव",
  "Mars": "मंगलदेव",
  "Mercury": "बुधदेव",
  "Jupiter": "बृहस्पतिदेव",
  "Venus": "शुक्रदेव",
  "Saturn": "शनिदेव",
  "Rahu": "राहु",
  "Ketu": "केतु",
  "Ascendant": "लग्न",
  "Aries": "मेष",
  "Taurus": "वृषभ",
  "Gemini": "मिथुन",
  "Cancer": "कर्क",
  "Leo": "सिंह",
  "Virgo": "कन्या",
  "Libra": "तुला",
  "Scorpio": "वृश्चिक",
  "Sagittarius": "धनु",
  "Capricorn": "मकर",
  "Aquarius": "कुम्भ",
  "Pisces": "मीन",
};

/**
 * Natural AI Voice Assistant with Distinct Male & Female Neural Voices
 */
export class NaturalVoiceAssistant {
  private static isSpeaking = false;
  private static activeUtterance: any = null;
  private static recognitionInstance: any = null;

  /**
   * Detects if the text contains Devanagari characters or Sanskrit Mantra phonetics
   */
  static detectLanguage(text: string, requestedLang?: "en" | "hi" | "sa"): "en" | "hi" | "sa" {
    if (requestedLang === "sa" || requestedLang === "hi") return requestedLang;

    // Check for Devanagari script (Hindi / Sanskrit)
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    if (hasDevanagari) {
      return "hi";
    }

    // Check for common transliterated Sanskrit/Mantra terms
    const hasMantraTerms = /\b(om|shreem|kleem|namah|swaha|gayatri|hare krishna|vasudevaya|mrityunjaya|shloka|bhagavad|gita|dharma|karma)\b/i.test(
      text
    );
    if (hasMantraTerms) {
      return "hi"; // Hindi/Indian accent synthesizes Sanskrit mantras best
    }

    return "en";
  }

  /**
   * Speak with distinct Male or Female AI Voice Tone
   */
  static speak(
    text: string,
    lang?: "en" | "hi" | "sa",
    voiceGender: "male" | "female" = "male",
    onStart?: () => void,
    onDone?: () => void,
    onError?: () => void
  ) {
    this.stop();
    if (!text || !text.trim()) return;

    // Auto-detect language if text has Hindi/Sanskrit
    const effectiveLang = this.detectLanguage(text, lang);

    // Clean text of markdown asterisks, hashes, and emojis for smooth natural speech
    let cleanText = text
      .replace(/[*_~`#]/g, "")
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/•/g, ",")
      .replace(/\|/g, "।")
      .trim();

    // If speaking in Hindi or Sanskrit, replace any accidental English planet names with pure Hindi names
    if (effectiveLang === "hi" || effectiveLang === "sa") {
      Object.entries(ENGLISH_TO_HINDI_TERMS).forEach(([eng, hin]) => {
        const regex = new RegExp(`\\b${eng}\\b`, "gi");
        cleanText = cleanText.replace(regex, hin);
      });
    }

    const isIndianOrHindi = effectiveLang === "hi" || effectiveLang === "sa";
    const targetLangCode = isIndianOrHindi ? "hi-IN" : "en-IN";

    // Web SpeechSynthesis with accurate Male / Female Voice Matching & Pitch Tuning
    if (Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window) {
      this.isSpeaking = true;
      onStart?.();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.activeUtterance = utterance;

      const voices = window.speechSynthesis.getVoices();

      if (voices && voices.length > 0) {
        // Filter candidate voices by language
        const langVoices = voices.filter((v) => {
          const vLang = v.lang.toLowerCase();
          return isIndianOrHindi
            ? vLang.startsWith("hi") || vLang.includes("in")
            : vLang.startsWith("en");
        });

        const pool = langVoices.length > 0 ? langVoices : voices;

        let selectedVoice: SpeechSynthesisVoice | undefined;

        if (voiceGender === "male") {
          // Look for male-named voices
          selectedVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes("male") ||
              name.includes("prabhat") ||
              name.includes("rishi") ||
              name.includes("david") ||
              name.includes("guy") ||
              name.includes("mark") ||
              name.includes("alex") ||
              name.includes("daniel") ||
              name.includes("oliver") ||
              name.includes("george") ||
              name.includes("madhur") ||
              name.includes("heera")
            );
          });
        } else {
          // Look for female-named voices
          selectedVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes("female") ||
              name.includes("neerja") ||
              name.includes("swara") ||
              name.includes("lekha") ||
              name.includes("veena") ||
              name.includes("samantha") ||
              name.includes("zira") ||
              name.includes("jenny") ||
              name.includes("victoria") ||
              name.includes("karen") ||
              name.includes("kavya") ||
              name.includes("pallavi")
            );
          });
        }

        // Fallback to any natural voice if specific gender match not labeled in name
        if (!selectedVoice) {
          selectedVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return (
              name.includes("natural") ||
              name.includes("neural") ||
              name.includes("google") ||
              name.includes("siri") ||
              name.includes("enhanced") ||
              name.includes("premium")
            );
          }) || pool[0];
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Strong Acoustic Pitch Separation for Male vs Female
      if (voiceGender === "male") {
        utterance.pitch = 0.84; // Deep, grounded, authoritative Acharya male resonance
        utterance.rate = effectiveLang === "sa" ? 0.82 : 0.88;
      } else {
        utterance.pitch = 1.22; // Melodious, bright, warm female Acharya resonance
        utterance.rate = effectiveLang === "sa" ? 0.86 : 0.94;
      }

      utterance.volume = 1.0;

      utterance.onend = () => {
        this.isSpeaking = false;
        this.activeUtterance = null;
        onDone?.();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis error", e);
        this.isSpeaking = false;
        this.activeUtterance = null;
        onError?.();
      };

      window.speechSynthesis.speak(utterance);
      return;
    }

    // Native Mobile (iOS / Android) Expo Speech
    this.isSpeaking = true;
    onStart?.();

    Speech.speak(cleanText, {
      language: targetLangCode,
      pitch: voiceGender === "male" ? 0.82 : 1.22,
      rate: voiceGender === "male" ? 0.86 : 0.92,
      onDone: () => {
        this.isSpeaking = false;
        onDone?.();
      },
      onError: () => {
        this.isSpeaking = false;
        onError?.();
      },
    });
  }

  /**
   * Stop any active speech
   */
  static stop() {
    this.isSpeaking = false;

    if (Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    } else {
      Speech.stop();
    }
  }

  static getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Free Browser/OS Microphone Voice Recognition (Speech-to-Text)
   */
  static startListening(
    lang: "en" | "hi" | "sa" = "en",
    handlers: SpeechRecognitionHandlers
  ): boolean {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        handlers.onError?.("Speech recognition not supported in this browser");
        return false;
      }

      this.stopListening();

      const recognition = new SpeechRecognition();
      this.recognitionInstance = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang =
        lang === "hi" ? "hi-IN" : lang === "sa" ? "hi-IN" : "en-US";

      recognition.onstart = () => {
        handlers.onStart?.();
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        handlers.onResult?.(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        handlers.onError?.(event.error);
      };

      recognition.onend = () => {
        handlers.onEnd?.();
      };

      try {
        recognition.start();
        return true;
      } catch (err) {
        console.warn("Failed to start speech recognition", err);
        handlers.onError?.("Could not start microphone");
        return false;
      }
    }

    handlers.onError?.("Voice input is active on Web/Chrome/Safari");
    return false;
  }

  static stopListening() {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (e) {}
      this.recognitionInstance = null;
    }
  }
}
