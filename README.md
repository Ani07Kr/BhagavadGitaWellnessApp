# 🕉️ Bhagavad Gita Wellness App (श्रीमद्भगवद्गीता कल्याणम्)

> **A holistic Vedic wellness and AI-powered mental health platform inspired by the timeless teachings of the Bhagavad Gita and ancient Indian Vedic sciences.**

---

## 🌟 Project Overview

**Bhagavad Gita Wellness** seamlessly bridges ancient Vedic wisdom with modern AI technologies. It offers personalized mental health assessments, real-time facial emotion recognition, ECG stress coherence analysis, full **Vedic Janam Kundli (जन्म कुंडली)** calculations, live **Daily Vedic Panchang (पञ्चाङ्गम्)**, and an interactive **Vedic Astrologer AI Voice Companion** supporting **English**, **हिन्दी (Hindi)**, and **संस्कृतम् (Sanskrit)**.

---

## ✨ Key Features & Architecture

### 1. 🌌 10-Second Sacred Vedic Cosmic Preloader
* **136.10 Hz Cosmic Om Tuning Frequency**: Authentic meditative temple soundscape with harmonic overtones and Tibetan singing bowl bell chimes.
* **Falling & Jumping Mantras Animation**: 22 glowing golden Sanskrit mantras (*`ॐ नमः शिवाय`*, *`ॐ नमो भगवते वासुदेवाय`*, *`हरे कृष्ण`*, *`कर्मण्येवाधिकारस्ते`*, *`तत्त्वमसि`*) with dynamic sine-wave bounce physics.
* **Radiant Golden Mandala**: Pulsating central **ॐ** emblem with a 10-second countdown progress indicator and quick-skip capability.

### 2. 🧭 Vedic Janam Kundli (जन्म कुंडली) & 2026 Forecast
* **Authentic Lahiri Ayanamsha Ephemeris Engine**: Real-time astronomical planetary positions across all 12 Rasis and 12 Bhavas.
* **Interactive North Indian Kundli Diamond Chart**: Clean SVG-rendered Vedic chart mapping planets (*Surya, Chandra, Mangala, Budha, Guru, Shukra, Shani, Rahu, Ketu*).
* **Vimshottari Dasha System**: Multi-level Mahadasha & Antardasha calculation with active planetary periods.
* **Prescribed Gita Shlokas**: Personalized Bhagavad Gita verses tailored to planetary doshas with studio audio chanting.
* **User-Scoped Privacy**: Multi-profile storage strictly keyed by user ID (`vedic_kundli_profiles_user_<id>`), ensuring 100% data isolation.

### 3. ☀️ Daily Vedic Panchang (दैनिक पञ्चाङ्गम्)
* **5 Core Angas**: Real-time Tithi, Vara, Nakshatra, Yoga, and Karana.
* **Muhurta Engine**: Real-time calculation of **Abhijit Muhurta**, **Amrit Kaal**, **Brahma Muhurta**, **Rahu Kalam**, **Yamaganda**, and **Gulika Kalam**.
* **Live Solar & Lunar Timings**: Sunrise, Sunset, Moonrise, and Moonset with live countdown to day/night transitions.
* **Daily Shloka Chanting**: Audio recitation of daily presiding deity mantras.

### 4. 🪐 Live Vedic Kaal Chakra / Cosmic Clock
* Interactive cosmic dial displaying the current Planetary Hour (**Hora**) and planetary rulership of the moment.
* Visual astrological guidance for optimal meditation, study, duty, and contemplation times.

### 5. 🤖 Vedic Astrologer AI Bot (ऋषि संवाद)
* **Real-time Voice Conversation**: Powered by Google Gemini AI with deep Vedic Jyotish and Bhagavad Gita philosophical grounding.
* **Dual Voice Switcher**: Instant switching between **👨 Male Acharya** (deep, resonant pitch) and **👩 Female Acharya** (melodious, serene pitch).
* **Trilingual Speech**: Full conversational voice and text support in **English**, **हिन्दी**, and **संस्कृतम्**.
* **Microphone Voice Input**: Hands-free voice recognition.

### 6. 🧠 AI Mental Assessment & Tri-Guna Balance (मनो स्थिति)
* 10 psychological questions rooted in Gita Chapter 14 (*Guna Traya Vibhaga Yoga*).
* **Tri-Guna Scoring Engine**: Analyzes **Sattva** (purity & calm), **Rajas** (passion & restlessness), and **Tamas** (inertia & gloom).
* **Audio Voice Guidance**: 1-tap voice reader for questions and options.
* **Detailed Results Screen**: Visual Guna balance meters, spiritual reflection story, tailored mantra, and full multi-lingual AI voice reading.

### 7. 📷 Facial Emotion Detection (भाव दर्शन)
* Real-time camera feed analysis assessing facial expressions, calm demeanor, and stress indicators with custom Vedic remedies.

### 8. 💓 ECG Coherence & Stress Analysis (हृदय स्पंदन)
* Upload ECG images or PDF medical reports to assess heart rate, QRS interval, and cardiovascular stress levels with calming Gita mantras.

### 9. 📖 Daily Gita Wisdom on Dashboard
* Curated library of authentic Bhagavad Gita verses in Sanskrit Devanagari, pure Hindi bhavarth, and English spiritual translation.
* **AI Sacred Chanting**: 1-tap audio chanting with Male/Female voice switching and random shuffle explorer.

### 10. ⏱️ 3-Minute Guest Mode Access
* Explore the complete application without creating an account.
* **Zero Data Saved**: Bypasses all persistent storage and database writes.
* **Live Floating Countdown Banner**: Real-time timer with urgency color-shift and automatic logout after 3 minutes.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 52) |
| **Routing** | [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Backend & DB** | [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security) |
| **AI & LLM** | [Google Gemini AI API](https://ai.google.dev/) (`gemini-1.5-flash`) |
| **Audio & Voice** | Web Audio API (136.1 Hz Synth) + Neural Multi-Lingual Speech Streaming |
| **Icons & UI** | [Lucide React Native](https://lucide.dev/), Vanilla CSS / React Native StyleSheet |
| **Storage** | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) |

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or newer recommended)
* [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)
* [Expo Go](https://expo.dev/client) app on iOS/Android (for mobile testing)

### 1. Clone the Repository
```bash
git clone https://github.com/Ani07Kr/BhagavadGitaWellnessApp.git
cd BhagavadGitaWellnessApp
```

### 2. Install Dependencies
```bash
npm install
# or
bun install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_GEMINI_API_KEY=your-google-gemini-api-key
```

### 4. Start the Application
```bash
# Start Web development server
npx expo start --web

# Start cross-platform Expo dev server (iOS / Android / Web)
npx expo start
```
Open **`http://localhost:8081`** in your web browser or scan the QR code with **Expo Go** on your physical mobile device.

---

## 🗄️ Database Setup (Supabase)

Execute the following SQL schema in your **Supabase SQL Editor**:

```sql
-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Responses Table
CREATE TABLE IF NOT EXISTS public.user_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  emotional_score NUMERIC NOT NULL,
  recommended_mantra TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Face Analysis Table
CREATE TABLE IF NOT EXISTS public.face_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_emotion TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ECG Reports Table
CREATE TABLE IF NOT EXISTS public.ecg_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  heart_rate NUMERIC,
  qrs_interval NUMERIC,
  stress_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.face_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecg_reports ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (User Isolation)
CREATE POLICY "Users can read own responses" ON public.user_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses" ON public.user_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own face analysis" ON public.face_analysis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own face analysis" ON public.face_analysis FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own ecg reports" ON public.ecg_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ecg reports" ON public.ecg_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 🔒 Security & Privacy

* **Strict User Isolation**: All personal Kundli charts, assessment history, and biometric reports are accessible strictly by the authenticated owner.
* **Guest Mode Sanitization**: Guest sessions exist entirely in-memory with automatic cleanup upon expiry or session termination.
* **Environment Protection**: All private API keys and tokens are excluded from version control via `.gitignore`.

---

## 📜 License

This project is created for educational, research, and holistic wellness purposes under the **MIT License**.

> *“कर्मण्येवाधिकारस्ते मा फलेषु कदाचन”*  
> *(You have a right to perform your prescribed duty, but you are not entitled to the fruits of action.)* — **Bhagavad Gita 2.47**