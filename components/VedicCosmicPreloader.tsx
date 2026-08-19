import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { Sparkles, Volume2, VolumeX, ArrowRight, Music } from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PRELOADER_DURATION_SEC = 10;

const SACRED_MANTRAS = [
  "ॐ",
  "ॐ नमः शिवाय",
  "ॐ नमो भगवते वासुदेवाय",
  "हरे कृष्ण हरे राम",
  "ॐ भूर्भुवः स्वः",
  "गायत्री मन्त्र",
  "ॐ शान्तिः शान्तिः शान्तिः",
  "कर्मण्येवाधिकारस्ते",
  "योगस्थः कुरु कर्माणि",
  "सत्यमेव जयते",
  "अहं ब्रह्मास्मि",
  "तत्त्वमसि",
  "वसुधैव कुटुम्बकम्",
  "सर्वे भवन्तु सुखिनः",
  "ॐ तत्सत्",
  "अमृतं तु विद्या",
  "आनन्दो ब्रह्म",
  "प्रज्ञानं ब्रह्म",
];

interface Particle {
  id: number;
  text: string;
  x: number;
  animY: Animated.Value;
  animBounce: Animated.Value;
  animOpacity: Animated.Value;
  animScale: Animated.Value;
  animRotate: Animated.Value;
  speedDuration: number;
  fontSize: number;
}

interface VedicCosmicPreloaderProps {
  onComplete: () => void;
}

export default function VedicCosmicPreloader({ onComplete }: VedicCosmicPreloaderProps) {
  const [secondsLeft, setSecondsLeft] = useState(PRELOADER_DURATION_SEC);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStartedAudio, setHasStartedAudio] = useState(false);

  // Center Om animations
  const omPulseAnim = useRef(new Animated.Value(1)).current;
  const omGlowAnim = useRef(new Animated.Value(0.4)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Web Audio Context reference for Sacred Om Music Engine
  const audioContextRef = useRef<any>(null);
  const masterGainRef = useRef<any>(null);
  const bellTimersRef = useRef<any[]>([]);

  // Generate 22 falling and jumping mantra particles across the entire screen
  const particles = useRef<Particle[]>(
    Array.from({ length: 22 }, (_, index) => {
      const colWidth = SCREEN_WIDTH / 6;
      const colIndex = index % 6;
      const initialX = Math.max(10, Math.min(SCREEN_WIDTH - 120, colIndex * colWidth + (Math.random() * 30 - 15)));

      return {
        id: index,
        text: SACRED_MANTRAS[index % SACRED_MANTRAS.length],
        x: initialX,
        animY: new Animated.Value(-60 - Math.random() * 200),
        animBounce: new Animated.Value(0),
        animOpacity: new Animated.Value(0.25 + Math.random() * 0.7),
        animScale: new Animated.Value(0.85 + Math.random() * 0.4),
        animRotate: new Animated.Value(Math.random() * 20 - 10),
        speedDuration: 3500 + Math.random() * 3000,
        fontSize: Math.floor(13 + Math.random() * 11),
      };
    })
  ).current;

  // Helper to trigger pure singing bowl bell chime
  const playSingingBowlChime = (ctx: any, destination: any, freq = 544.4) => {
    try {
      const osc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.998, ctx.currentTime + 3.0);

      chimeGain.gain.setValueAtTime(0.2, ctx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2);

      osc.connect(chimeGain);
      chimeGain.connect(destination);

      osc.start();
      osc.stop(ctx.currentTime + 3.3);
    } catch (e) {}
  };

  // Pure Meditative Sacred Om Music Synthesizer (NO AI Voice Assistant)
  const startSacredOmMusic = () => {
    if (hasStartedAudio) return;
    setHasStartedAudio(true);

    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === "suspended") {
            ctx.resume();
          }
          audioContextRef.current = ctx;

          // Master Gain with gentle 1.5s fade-in
          const masterGain = ctx.createGain();
          masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
          masterGain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 1.5);
          masterGain.connect(ctx.destination);
          masterGainRef.current = masterGain;

          // Low-pass filter for warm, deep temple acoustic warmth
          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(450, ctx.currentTime);
          filter.Q.setValueAtTime(3.0, ctx.currentTime);
          filter.connect(masterGain);

          // 1. Primordial 136.10 Hz Root Cosmic Om Drone (Cis)
          const osc1 = ctx.createOscillator();
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(136.1, ctx.currentTime);
          osc1.connect(filter);
          osc1.start();

          // 2. Harmonic Pancham (204.15 Hz - Sacred Fifth)
          const osc2 = ctx.createOscillator();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(204.15, ctx.currentTime);
          const osc2Gain = ctx.createGain();
          osc2Gain.gain.value = 0.18;
          osc2.connect(osc2Gain);
          osc2Gain.connect(filter);
          osc2.start();

          // 3. Octave Overtone (272.2 Hz) with Breathing AUM Vibrato
          const osc3 = ctx.createOscillator();
          osc3.type = "sine";
          osc3.frequency.setValueAtTime(272.2, ctx.currentTime);

          // LFO for rhythmic pulsing AUM breath
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.25, ctx.currentTime); // 1 breath every 4s
          lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);
          lfo.connect(lfoGain);

          const osc3Gain = ctx.createGain();
          osc3Gain.gain.value = 0.14;
          lfoGain.connect(osc3Gain.gain);

          osc3.connect(osc3Gain);
          osc3Gain.connect(filter);
          lfo.start();
          osc3.start();

          // 4. Sub-bass Tanpura Resonance (68.05 Hz)
          const oscBass = ctx.createOscillator();
          oscBass.type = "triangle";
          oscBass.frequency.setValueAtTime(68.05, ctx.currentTime);
          const bassGain = ctx.createGain();
          bassGain.gain.value = 0.12;
          oscBass.connect(bassGain);
          bassGain.connect(masterGain);
          oscBass.start();

          // 5. Singing Bowl Bell Chimes at 0.2s, 3.5s, and 7.0s
          playSingingBowlChime(ctx, masterGain, 544.4);

          const bellTimer1 = setTimeout(() => {
            if (audioContextRef.current && audioContextRef.current.state === "running") {
              playSingingBowlChime(audioContextRef.current, masterGain, 544.4);
              playSingingBowlChime(audioContextRef.current, masterGain, 1088.8);
            }
          }, 3500);

          const bellTimer2 = setTimeout(() => {
            if (audioContextRef.current && audioContextRef.current.state === "running") {
              playSingingBowlChime(audioContextRef.current, masterGain, 544.4);
            }
          }, 7000);

          bellTimersRef.current = [bellTimer1, bellTimer2];
        }
      }
    } catch (e) {
      console.warn("Sacred Om Audio initiation:", e);
    }
  };

  const stopSacredOmMusic = () => {
    bellTimersRef.current.forEach((t) => clearTimeout(t));
    bellTimersRef.current = [];

    if (audioContextRef.current) {
      try {
        if (masterGainRef.current) {
          masterGainRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.3);
        }
        setTimeout(() => {
          audioContextRef.current?.close();
          audioContextRef.current = null;
        }, 400);
      } catch (e) {}
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (masterGainRef.current && audioContextRef.current) {
        masterGainRef.current.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      }
    } else {
      setIsMuted(true);
      if (masterGainRef.current && audioContextRef.current) {
        masterGainRef.current.gain.setValueAtTime(0.0001, audioContextRef.current.currentTime);
      }
    }
  };

  useEffect(() => {
    // Start pure Om music on load / tap
    startSacredOmMusic();

    // 2. Pulse Om Center Aura Animation (Continuous)
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(omPulseAnim, {
            toValue: 1.15,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(omGlowAnim, {
            toValue: 0.95,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(omPulseAnim, {
            toValue: 0.95,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(omGlowAnim, {
            toValue: 0.35,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 3. Falling & Jumping Sacred Mantras across the screen
    particles.forEach((p, idx) => {
      const startFallingLoop = () => {
        p.animY.setValue(-50 - (idx * 22));

        // Falling trajectory
        Animated.timing(p.animY, {
          toValue: SCREEN_HEIGHT + 60,
          duration: p.speedDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
          startFallingLoop();
        });

        // Lateral Jumping / Floating Sine oscillation
        Animated.loop(
          Animated.sequence([
            Animated.timing(p.animBounce, {
              toValue: 20,
              duration: 900 + (idx % 4) * 200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(p.animBounce, {
              toValue: -20,
              duration: 900 + (idx % 4) * 200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      // Stagger start
      setTimeout(() => {
        startFallingLoop();
      }, idx * 160);
    });

    // 4. Progress bar animation (Exactly 10 Seconds)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: PRELOADER_DURATION_SEC * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // 5. 1-second countdown ticker (10s -> 0s)
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          stopSacredOmMusic();
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      stopSacredOmMusic();
    };
  }, []);

  const handleSkip = () => {
    stopSacredOmMusic();
    onComplete();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container} onTouchStart={startSacredOmMusic}>
      {/* Dark Cosmic Sky Background */}
      <View style={styles.starsOverlay} />

      {/* Falling & Jumping Sacred Mantras across the screen */}
      {particles.map((p) => {
        const spin = p.animRotate.interpolate({
          inputRange: [-10, 10],
          outputRange: ["-10deg", "10deg"],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particleWrapper,
              {
                left: p.x,
                opacity: p.animOpacity,
                transform: [
                  { translateY: p.animY },
                  { translateX: p.animBounce },
                  { scale: p.animScale },
                  { rotate: spin },
                ],
              },
            ]}
          >
            <Text
              style={[
                styles.mantraText,
                {
                  fontSize: p.fontSize,
                  textShadowColor: "rgba(245, 158, 11, 0.9)",
                },
              ]}
            >
              {p.text}
            </Text>
          </Animated.View>
        );
      })}

      {/* Center Sacred Om Mandala */}
      <View style={styles.centerMandala}>
        {/* Outer Radiant Glow Rings */}
        <Animated.View
          style={[
            styles.glowOuterRing,
            {
              opacity: omGlowAnim,
              transform: [{ scale: omPulseAnim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.glowMiddleRing,
            {
              opacity: omGlowAnim,
              transform: [{ scale: omPulseAnim }],
            },
          ]}
        />

        {/* Core Glowing Om Symbol */}
        <Animated.View
          style={[
            styles.omCoreCircle,
            {
              transform: [{ scale: omPulseAnim }],
            },
          ]}
        >
          <Text style={styles.omGlyph}>ॐ</Text>
        </Animated.View>

        <Text style={styles.mandalaTitle}>Bhagavad Gita Wellness</Text>
        <Text style={styles.mandalaSubtitle}>
          Awakening Vedic Consciousness & Inner Peace
        </Text>

        <View style={styles.sacredChantPill}>
          <Music size={13} color="#f59e0b" />
          <Text style={styles.sacredChantText}>
            Sacred 136.1 Hz Om Music Active
          </Text>
        </View>
      </View>

      {/* Bottom Progress & Skip Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
          </View>
          <View style={styles.progressLabelRow}>
            <Text style={styles.enteringText}>
              Entering Sacred Space in <Text style={styles.secondsHighlight}>{secondsLeft}s</Text>
            </Text>
            <TouchableOpacity onPress={toggleMute} style={styles.soundToggleBtn}>
              {isMuted ? (
                <VolumeX size={15} color="#d1d5db" />
              ) : (
                <Volume2 size={15} color="#f59e0b" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.8}>
          <Text style={styles.skipButtonText}>Enter Directly (प्रवेश करें)</Text>
          <ArrowRight size={14} color="#fcd34d" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#090514", // Deep sacred cosmic midnight
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999999,
    overflow: "hidden",
  },
  starsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  particleWrapper: {
    position: "absolute",
    top: 0,
    zIndex: 10,
    pointerEvents: "none",
  },
  mantraText: {
    color: "#fef08a",
    fontWeight: "bold",
    letterSpacing: 0.5,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  centerMandala: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    paddingHorizontal: 24,
  },
  glowOuterRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: "rgba(245, 158, 11, 0.4)",
    backgroundColor: "rgba(245, 158, 11, 0.04)",
  },
  glowMiddleRing: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: "rgba(251, 191, 36, 0.6)",
    backgroundColor: "rgba(251, 191, 36, 0.08)",
  },
  omCoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1e1338",
    borderWidth: 2.5,
    borderColor: "#fbbf24",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 24,
  },
  omGlyph: {
    fontSize: 54,
    color: "#fbbf24",
    fontWeight: "bold",
    textShadowColor: "rgba(251, 191, 36, 0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  mandalaTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fef3c7",
    letterSpacing: 0.8,
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "rgba(245, 158, 11, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  mandalaSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  sacredChantPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  sacredChantText: {
    fontSize: 11.5,
    color: "#fde68a",
    fontWeight: "700",
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 30,
  },
  progressContainer: {
    width: "100%",
    maxWidth: 360,
    marginBottom: 16,
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#f59e0b",
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  enteringText: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  secondsHighlight: {
    color: "#fbbf24",
    fontWeight: "800",
  },
  soundToggleBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderWidth: 1,
    borderColor: "#f59e0b",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fde68a",
  },
});
