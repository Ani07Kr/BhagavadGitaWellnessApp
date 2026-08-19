import { EmotionType } from "./supabase";

export interface GunaProfile {
  sattva: number; // 0 - 100% (Clarity, peace, equilibrium)
  rajas: number;  // 0 - 100% (Passion, restlessness, stress)
  tamas: number;  // 0 - 100% (Inertia, anxiety, heaviness)
  dominantGuna: "Sattva" | "Rajas" | "Tamas";
}

export interface AIWellnessAnalysis {
  emotionalScore: number; // 1.0 - 5.0
  emotionalState: EmotionType;
  headline: string;
  summary: string;
  gunaProfile: GunaProfile;
  mantra: {
    text: string;
    explanation: string;
  };
  gitaWisdom: {
    chapter: string;
    verse: string;
    reflection: string;
  };
  actionableInsights: string[];
  isAiGenerated: boolean;
}

export interface QuestionAnswer {
  questionId: number;
  questionText: string;
  category?: string;
  selectedOption: {
    id: number;
    text: string;
    value: number; // 1 to 5
  };
}

/**
 * Built-in Vedic Psychology Evaluator (100% Offline & Deterministic)
 */
export function evaluateVedicGunaProfile(answers: QuestionAnswer[]): AIWellnessAnalysis {
  if (answers.length === 0) {
    return getFallbackAnalysis();
  }

  let totalScore = 0;
  let emotionalScores: number[] = [];
  let physicalScores: number[] = [];
  let spiritualScores: number[] = [];
  let socialScores: number[] = [];

  answers.forEach((ans) => {
    const val = ans.selectedOption.value || 3;
    totalScore += val;

    const cat = (ans.category || "").toLowerCase();
    if (cat.includes("physical")) physicalScores.push(val);
    else if (cat.includes("spiritual")) spiritualScores.push(val);
    else if (cat.includes("social")) socialScores.push(val);
    else emotionalScores.push(val);
  });

  const avgScore = totalScore / answers.length;
  const normalizedScore = Math.round(avgScore * 10) / 10;

  // Compute Guna Distribution based on Ayurvedic & Gita Psychometric Mapping
  // Value 4-5: Sattvic tendencies (peace, clarity)
  // Value 2-3: Rajasic tendencies (strain, agitation, seeking)
  // Value 1-2: Tamasic tendencies (burnout, lethargy, anxiety)
  let sattvaWeight = 0;
  let rajasWeight = 0;
  let tamasWeight = 0;

  answers.forEach((ans) => {
    const v = ans.selectedOption.value;
    if (v >= 4) {
      sattvaWeight += (v === 5 ? 3 : 2);
      rajasWeight += 1;
    } else if (v === 3) {
      sattvaWeight += 1;
      rajasWeight += 2;
      tamasWeight += 1;
    } else {
      tamasWeight += (v === 1 ? 3 : 2);
      rajasWeight += 1;
    }
  });

  const totalGunaWeight = Math.max(1, sattvaWeight + rajasWeight + tamasWeight);
  const sattvaPercent = Math.round((sattvaWeight / totalGunaWeight) * 100);
  const rajasPercent = Math.round((rajasWeight / totalGunaWeight) * 100);
  const tamasPercent = Math.max(0, 100 - sattvaPercent - rajasPercent);

  let dominantGuna: "Sattva" | "Rajas" | "Tamas" = "Sattva";
  if (rajasPercent >= sattvaPercent && rajasPercent >= tamasPercent) dominantGuna = "Rajas";
  else if (tamasPercent >= sattvaPercent && tamasPercent >= rajasPercent) dominantGuna = "Tamas";

  // Determine Emotion Type
  let emotionType: EmotionType = "neutral";
  if (normalizedScore >= 4.2) emotionType = "very_positive";
  else if (normalizedScore >= 3.3) emotionType = "positive";
  else if (normalizedScore >= 2.4) emotionType = "neutral";
  else emotionType = "negative";

  // Vedic Gita Prescriptions
  if (dominantGuna === "Sattva") {
    return {
      emotionalScore: normalizedScore,
      emotionalState: emotionType,
      headline: "State of Sattvic Harmony & Clarity",
      summary: "Your mind reflects elevated Sattva — equilibrium, self-awareness, and emotional stability. Continue cultivating mindfulness and gratitude.",
      gunaProfile: {
        sattva: sattvaPercent,
        rajas: rajasPercent,
        tamas: tamasPercent,
        dominantGuna: "Sattva",
      },
      mantra: {
        text: "Om Shanti Shanti Shantihi",
        explanation: "Invocation of threefold peace across physical, mental, and cosmic realms to preserve spiritual harmony.",
      },
      gitaWisdom: {
        chapter: "Chapter 6, Verse 30",
        verse: "Yo mam pasyati sarvatra sarvam ca mayi pasyati",
        reflection: "Lord Krishna teaches that one who sees harmony in all beings and perceives the divine in everything remains perpetually centered in peace.",
      },
      actionableInsights: [
        "Practice 15 minutes of Pranayama (alternate nostril breathing) to anchor your peace.",
        "Dedicate time to selfless service or uplifting someone in need.",
        "Maintain a daily gratitude journaling habit.",
      ],
      isAiGenerated: false,
    };
  } else if (dominantGuna === "Rajas") {
    return {
      emotionalScore: normalizedScore,
      emotionalState: emotionType,
      headline: "Elevated Rajas: Restlessness & High Energy",
      summary: "Your responses indicate high Rajasic energy — driven by urgency, stress, or attachment to outcomes. The Gita advises cultivating stillness and detachment.",
      gunaProfile: {
        sattva: sattvaPercent,
        rajas: rajasPercent,
        tamas: tamasPercent,
        dominantGuna: "Rajas",
      },
      mantra: {
        text: "Karmanye Vadhikaraste Ma Phaleshu Kadachana",
        explanation: "You have a right to your duties, but not to the fruits thereof. Let go of anxiety regarding results and focus purely on your present actions.",
      },
      gitaWisdom: {
        chapter: "Chapter 2, Verse 47",
        verse: "Karmany-evadhikaras te ma phaleshu kadachana",
        reflection: "When we surrender obsession with future outcomes and devote ourselves entirely to righteous action, mental restlessness naturally dissolves.",
      },
      actionableInsights: [
        "Take 5-minute conscious breathing pauses throughout your workday.",
        "Practice Nishkama Karma: focus 100% on the quality of work rather than the immediate result.",
        "Unwind with classical flute/sitar ragas in the evening.",
      ],
      isAiGenerated: false,
    };
  } else {
    return {
      emotionalScore: normalizedScore,
      emotionalState: emotionType,
      headline: "Tamasic Heaviness: Healing & Renewal Needed",
      summary: "Your responses show signs of emotional fatigue, anxiety, or inertia. The Gita reminds us that our true spiritual nature transcends temporary storms.",
      gunaProfile: {
        sattva: sattvaPercent,
        rajas: rajasPercent,
        tamas: tamasPercent,
        dominantGuna: "Tamas",
      },
      mantra: {
        text: "Om Asato Ma Sadgamaya, Tamaso Ma Jyotirgamaya",
        explanation: "Lead me from illusion to truth, from darkness to light, from mortality to immortality. This mantra dispels mental darkness and awakens inner light.",
      },
      gitaWisdom: {
        chapter: "Chapter 2, Verse 14",
        verse: "Matra-sparsas tu kaunteya sitosna-sukha-duhkha-dah",
        reflection: "Pleasure and distress, heat and cold are fleeting sensory experiences. Krishna encourages Arjuna to endure them patiently without losing inner faith.",
      },
      actionableInsights: [
        "Step outside into natural morning sunlight for 15 minutes of gentle walking.",
        "Recite the healing Maha Mrityunjaya mantra for mental rejuvenation.",
        "Prioritize restful sleep and reduce late-night screen exposure.",
      ],
      isAiGenerated: false,
    };
  }
}

/**
 * Primary AI Analysis using Google Gemini API (with seamless Vedic Fallback)
 */
export async function analyzeMentalAssessmentWithAI(
  answers: QuestionAnswer[]
): Promise<AIWellnessAnalysis> {
  const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  // If no Gemini key is provided, use the high-precision Vedic algorithm instantly
  if (!geminiApiKey || geminiApiKey.trim() === "" || geminiApiKey === "your-gemini-api-key") {
    return evaluateVedicGunaProfile(answers);
  }

  try {
    const formattedAnswers = answers
      .map((a, i) => `Q${i + 1} (${a.category || "General"}): "${a.questionText}" -> Answer: "${a.selectedOption.text}" (Rating: ${a.selectedOption.value}/5)`)
      .join("\n");

    const prompt = `
You are a revered Vedic psychologist and Bhagavad Gita spiritual wellness counselor.
Analyze this user's psychological and emotional assessment responses:

${formattedAnswers}

Provide a deep, empathetic analysis grounded in Bhagavad Gita philosophy.
Return strictly valid JSON in this exact structure without markdown backticks:
{
  "emotionalScore": <number between 1.0 and 5.0>,
  "emotionalState": "<negative|neutral|positive|very_positive>",
  "headline": "<Inspiring 5-8 word headline summary of their state>",
  "summary": "<2-3 sentence empathetic analysis explaining their current psychological and spiritual state>",
  "gunaProfile": {
    "sattva": <number between 0 and 100>,
    "rajas": <number between 0 and 100>,
    "tamas": <number between 0 and 100>,
    "dominantGuna": "<Sattva|Rajas|Tamas>"
  },
  "mantra": {
    "text": "<Authentic Sanskrit Mantra in Roman script with correct meaning>",
    "explanation": "<Practical therapeutic meaning and benefits of chanting this mantra>"
  },
  "gitaWisdom": {
    "chapter": "<Chapter X, Verse Y>",
    "verse": "<Original Sanskrit verse in English transliteration>",
    "reflection": "<Inspiring 2-3 sentence story or reflection explaining how Lord Krishna's guidance in this verse directly solves the user's current situation>"
  },
  "actionableInsights": [
    "<Practical daily Vedic action item 1>",
    "<Practical daily Vedic action item 2>",
    "<Practical daily Vedic action item 3>"
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn("Gemini API error, falling back to Vedic Engine:", await response.text());
      return evaluateVedicGunaProfile(answers);
    }

    const json = await response.json();
    const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return evaluateVedicGunaProfile(answers);
    }

    const parsed: AIWellnessAnalysis = JSON.parse(rawText);
    parsed.isAiGenerated = true;
    return parsed;
  } catch (err) {
    console.warn("AI generation failed, using Vedic fallback:", err);
    return evaluateVedicGunaProfile(answers);
  }
}

function getFallbackAnalysis(): AIWellnessAnalysis {
  return {
    emotionalScore: 3.0,
    emotionalState: "neutral",
    headline: "Balanced Spiritual State",
    summary: "Your mind is in a balanced state. Regular meditation and reflection will deepen your inner stillness.",
    gunaProfile: {
      sattva: 45,
      rajas: 35,
      tamas: 20,
      dominantGuna: "Sattva",
    },
    mantra: {
      text: "Samatvam Yoga Uchyate",
      explanation: "Equanimity of mind is called yoga. Keep your mind steady through all life circumstances.",
    },
    gitaWisdom: {
      chapter: "Chapter 2, Verse 48",
      verse: "Yoga-sthah kuru karmani sangam tyaktva dhananjaya",
      reflection: "Perform your duties established in yoga, abandoning attachment to success or failure.",
    },
    actionableInsights: [
      "Practice 10 minutes of silent meditation.",
      "Read one verse of the Bhagavad Gita daily.",
      "Stay hydrated and take mindful walks in nature.",
    ],
    isAiGenerated: false,
  };
}
