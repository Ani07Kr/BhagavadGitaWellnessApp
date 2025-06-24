import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Alert, Platform } from "react-native";

// Replace with your Supabase URL and anon key
// IMPORTANT: Update these with your actual Supabase credentials
const supabaseUrl = "https://agckbqjhzzcelpysqpid.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnY2ticWpoenpjZWxweXNxcGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NTExNDcsImV4cCI6MjA2NjMyNzE0N30.FCgd316PkGUmHTx61rj17acCr65UYZUyYeA3kwkMLCs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Define emotion types for type safety
export type EmotionType = 
  | 'negative' 
  | 'neutral' 
  | 'positive' 
  | 'very_positive' 
  | 'healing' 
  | 'stress' 
  | 'anxiety' 
  | 'obstacles' 
  | 'clarity' 
  | 'transformation' 
  | 'abundance' 
  | 'empowerment' 
  | 'protection' 
  | 'devotion' 
  | 'immortality' 
  | 'truth' 
  | 'learning' 
  | 'unity' 
  | 'auspiciousness' 
  | 'cosmic_forces' 
  | 'transcendence' 
  | 'surrender';

// Define return types for functions
interface DatabaseResponse {
  success: boolean;
  error?: any;
  data?: any; // Add data property to fix TypeScript errors
}

interface MantraResponse extends DatabaseResponse {
  data?: {
    id?: number;
    text: string;
    emotion_type?: string;
    explanation: string;
    created_at?: string;
  };
}

interface SongResponse extends DatabaseResponse {
  data?: {
    id?: number;
    title: string;
    url: string;
    emotion_type: string;
    created_at?: string;
  };
}

// SQL to create tables in Supabase
export const createTables = `
-- Users table is automatically created by Supabase Auth
-- Add display_name column to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User responses table
CREATE TABLE IF NOT EXISTS public.user_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  emotional_score NUMERIC,
  recommended_mantra TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Face analysis table
CREATE TABLE IF NOT EXISTS public.face_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  detected_emotion TEXT NOT NULL,
  confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ECG reports table
CREATE TABLE IF NOT EXISTS public.ecg_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT,
  file_type TEXT, -- 'image' or 'pdf'
  heart_rate INTEGER,
  stress_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mantras table
CREATE TABLE IF NOT EXISTS public.mantras (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  emotion_type TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id SERIAL PRIMARY KEY,
  theme TEXT NOT NULL,
  emotion_type TEXT NOT NULL,
  story_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Songs table
CREATE TABLE IF NOT EXISTS public.songs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  emotion_type TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data for questions (50+ questions)
INSERT INTO public.questions (text, options, category) VALUES
-- Emotional Well-being (10 questions)
('How would you describe your overall mood today?', 
  '[
    {"id": 1, "text": "Very negative", "value": 1},
    {"id": 2, "text": "Somewhat negative", "value": 2},
    {"id": 3, "text": "Neutral", "value": 3},
    {"id": 4, "text": "Somewhat positive", "value": 4},
    {"id": 5, "text": "Very positive", "value": 5}
  ]', 'emotional'
),
('How well did you sleep last night?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Average", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'physical'
),
('How would you rate your stress level?', 
  '[
    {"id": 1, "text": "Extremely high", "value": 1},
    {"id": 2, "text": "High", "value": 2},
    {"id": 3, "text": "Moderate", "value": 3},
    {"id": 4, "text": "Low", "value": 4},
    {"id": 5, "text": "Very low", "value": 5}
  ]', 'emotional'
),
('How connected do you feel to others today?', 
  '[
    {"id": 1, "text": "Not at all", "value": 1},
    {"id": 2, "text": "Slightly", "value": 2},
    {"id": 3, "text": "Moderately", "value": 3},
    {"id": 4, "text": "Very", "value": 4},
    {"id": 5, "text": "Extremely", "value": 5}
  ]', 'social'
),
('How satisfied are you with your life right now?', 
  '[
    {"id": 1, "text": "Very dissatisfied", "value": 1},
    {"id": 2, "text": "Somewhat dissatisfied", "value": 2},
    {"id": 3, "text": "Neutral", "value": 3},
    {"id": 4, "text": "Somewhat satisfied", "value": 4},
    {"id": 5, "text": "Very satisfied", "value": 5}
  ]', 'emotional'
),
('How often do you feel overwhelmed by your emotions?', 
  '[
    {"id": 1, "text": "Almost always", "value": 1},
    {"id": 2, "text": "Often", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Rarely", "value": 4},
    {"id": 5, "text": "Almost never", "value": 5}
  ]', 'emotional'
),
('How well can you identify what you are feeling?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'emotional'
),
('How often do you experience joy in your daily life?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost always", "value": 5}
  ]', 'emotional'
),
('How well do you manage negative emotions?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'emotional'
),
('How often do you feel a sense of purpose in your life?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost always", "value": 5}
  ]', 'spiritual'
),

-- Physical Well-being (10 questions)
('How would you rate your physical health today?', 
  '[
    {"id": 1, "text": "Very poor", "value": 1},
    {"id": 2, "text": "Poor", "value": 2},
    {"id": 3, "text": "Average", "value": 3},
    {"id": 4, "text": "Good", "value": 4},
    {"id": 5, "text": "Excellent", "value": 5}
  ]', 'physical'
),
('How energetic do you feel today?', 
  '[
    {"id": 1, "text": "Not at all energetic", "value": 1},
    {"id": 2, "text": "Slightly energetic", "value": 2},
    {"id": 3, "text": "Moderately energetic", "value": 3},
    {"id": 4, "text": "Very energetic", "value": 4},
    {"id": 5, "text": "Extremely energetic", "value": 5}
  ]', 'physical'
),
('How satisfied are you with your physical activity level?', 
  '[
    {"id": 1, "text": "Very dissatisfied", "value": 1},
    {"id": 2, "text": "Somewhat dissatisfied", "value": 2},
    {"id": 3, "text": "Neutral", "value": 3},
    {"id": 4, "text": "Somewhat satisfied", "value": 4},
    {"id": 5, "text": "Very satisfied", "value": 5}
  ]', 'physical'
),
('How would you rate your eating habits today?', 
  '[
    {"id": 1, "text": "Very unhealthy", "value": 1},
    {"id": 2, "text": "Somewhat unhealthy", "value": 2},
    {"id": 3, "text": "Moderate", "value": 3},
    {"id": 4, "text": "Somewhat healthy", "value": 4},
    {"id": 5, "text": "Very healthy", "value": 5}
  ]', 'physical'
),
('How comfortable do you feel in your body?', 
  '[
    {"id": 1, "text": "Very uncomfortable", "value": 1},
    {"id": 2, "text": "Somewhat uncomfortable", "value": 2},
    {"id": 3, "text": "Neutral", "value": 3},
    {"id": 4, "text": "Somewhat comfortable", "value": 4},
    {"id": 5, "text": "Very comfortable", "value": 5}
  ]', 'physical'
),
('How often do you experience physical pain?', 
  '[
    {"id": 1, "text": "Almost always", "value": 1},
    {"id": 2, "text": "Often", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Rarely", "value": 4},
    {"id": 5, "text": "Almost never", "value": 5}
  ]', 'physical'
),
('How well do you maintain a balanced diet?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'physical'
),
('How satisfied are you with your sleep quality?', 
  '[
    {"id": 1, "text": "Very dissatisfied", "value": 1},
    {"id": 2, "text": "Somewhat dissatisfied", "value": 2},
    {"id": 3, "text": "Neutral", "value": 3},
    {"id": 4, "text": "Somewhat satisfied", "value": 4},
    {"id": 5, "text": "Very satisfied", "value": 5}
  ]', 'physical'
),
('How often do you engage in physical exercise?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost daily", "value": 5}
  ]', 'physical'
),
('How would you rate your overall physical fitness?', 
  '[
    {"id": 1, "text": "Very poor", "value": 1},
    {"id": 2, "text": "Poor", "value": 2},
    {"id": 3, "text": "Average", "value": 3},
    {"id": 4, "text": "Good", "value": 4},
    {"id": 5, "text": "Excellent", "value": 5}
  ]', 'physical'
),

-- Mental Well-being (10 questions)
('How well can you concentrate on tasks today?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'mental'
),
('How often do you feel mentally exhausted?', 
  '[
    {"id": 1, "text": "Almost always", "value": 1},
    {"id": 2, "text": "Often", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Rarely", "value": 4},
    {"id": 5, "text": "Almost never", "value": 5}
  ]', 'mental'
),
('How well do you handle challenging mental tasks?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'mental'
),
('How often do you engage in mentally stimulating activities?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost daily", "value": 5}
  ]', 'mental'
),
('How satisfied are you with your mental clarity?', 
  '[
    {"id": 1, "text": "Very dissatisfied", "value": 1},
    {"id": 2, "text": "Somewhat dissatisfied", "value": 2},
    {"id": 3, "text": "Neutral", "value": 3},
    {"id": 4, "text": "Somewhat satisfied", "value": 4},
    {"id": 5, "text": "Very satisfied", "value": 5}
  ]', 'mental'
),
('How often do you feel mentally alert and sharp?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost always", "value": 5}
  ]', 'mental'
),
('How well can you solve problems that arise in your life?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'mental'
),
('How often do you feel mentally creative?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost always", "value": 5}
  ]', 'mental'
),
('How well can you focus on a single task without distraction?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'mental'
),
('How often do you engage in mindfulness practices?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost daily", "value": 5}
  ]', 'mental'
),

-- Social Well-being (10 questions)
('How satisfied are you with your social relationships?', 
  '[
    {"id": 1, "text": "Very dissatisfied", "value": 1},
    {"id": 2, "text": "Somewhat dissatisfied", "value": 2},
    {"id": 3, "text": "Neutral", "value": 3},
    {"id": 4, "text": "Somewhat satisfied", "value": 4},
    {"id": 5, "text": "Very satisfied", "value": 5}
  ]', 'social'
),
('How often do you feel lonely?', 
  '[
    {"id": 1, "text": "Almost always", "value": 1},
    {"id": 2, "text": "Often", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Rarely", "value": 4},
    {"id": 5, "text": "Almost never", "value": 5}
  ]', 'social'
),
('How comfortable are you in social situations?', 
  '[
    {"id": 1, "text": "Very uncomfortable", "value": 1},
    {"id": 2, "text": "Somewhat uncomfortable", "value": 2},
    {"id": 3, "text": "Neutral", "value": 3},
    {"id": 4, "text": "Somewhat comfortable", "value": 4},
    {"id": 5, "text": "Very comfortable", "value": 5}
  ]', 'social'
),
('How often do you communicate with friends or family?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost daily", "value": 5}
  ]', 'social'
),
('How supported do you feel by others in your life?', 
  '[
    {"id": 1, "text": "Not at all supported", "value": 1},
    {"id": 2, "text": "Slightly supported", "value": 2},
    {"id": 3, "text": "Moderately supported", "value": 3},
    {"id": 4, "text": "Very supported", "value": 4},
    {"id": 5, "text": "Extremely supported", "value": 5}
  ]', 'social'
),
('How well do you communicate your needs to others?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'social'
),
('How often do you feel understood by others?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost always", "value": 5}
  ]', 'social'
),
('How satisfied are you with your ability to set boundaries?', 
  '[
    {"id": 1, "text": "Very dissatisfied", "value": 1},
    {"id": 2, "text": "Somewhat dissatisfied", "value": 2},
    {"id": 3, "text": "Neutral", "value": 3},
    {"id": 4, "text": "Somewhat satisfied", "value": 4},
    {"id": 5, "text": "Very satisfied", "value": 5}
  ]', 'social'
),
('How often do you engage in meaningful social interactions?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost daily", "value": 5}
  ]', 'social'
),
('How well do you resolve conflicts with others?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'social'
),

-- Spiritual Well-being (10 questions)
('How connected do you feel to something greater than yourself?', 
  '[
    {"id": 1, "text": "Not at all connected", "value": 1},
    {"id": 2, "text": "Slightly connected", "value": 2},
    {"id": 3, "text": "Moderately connected", "value": 3},
    {"id": 4, "text": "Very connected", "value": 4},
    {"id": 5, "text": "Extremely connected", "value": 5}
  ]', 'spiritual'
),
('How often do you engage in spiritual practices?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost daily", "value": 5}
  ]', 'spiritual'
),
('How meaningful do you find your life to be?', 
  '[
    {"id": 1, "text": "Not at all meaningful", "value": 1},
    {"id": 2, "text": "Slightly meaningful", "value": 2},
    {"id": 3, "text": "Moderately meaningful", "value": 3},
    {"id": 4, "text": "Very meaningful", "value": 4},
    {"id": 5, "text": "Extremely meaningful", "value": 5}
  ]', 'spiritual'
),
('How aligned do you feel with your core values?', 
  '[
    {"id": 1, "text": "Not at all aligned", "value": 1},
    {"id": 2, "text": "Slightly aligned", "value": 2},
    {"id": 3, "text": "Moderately aligned", "value": 3},
    {"id": 4, "text": "Very aligned", "value": 4},
    {"id": 5, "text": "Completely aligned", "value": 5}
  ]', 'spiritual'
),
('How often do you experience a sense of awe or wonder?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost daily", "value": 5}
  ]', 'spiritual'
),
('How connected do you feel to nature?', 
  '[
    {"id": 1, "text": "Not at all connected", "value": 1},
    {"id": 2, "text": "Slightly connected", "value": 2},
    {"id": 3, "text": "Moderately connected", "value": 3},
    {"id": 4, "text": "Very connected", "value": 4},
    {"id": 5, "text": "Extremely connected", "value": 5}
  ]', 'spiritual'
),
('How often do you reflect on the meaning of life?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost daily", "value": 5}
  ]', 'spiritual'
),
('How satisfied are you with your spiritual growth?', 
  '[
    {"id": 1, "text": "Very dissatisfied", "value": 1},
    {"id": 2, "text": "Somewhat dissatisfied", "value": 2},
    {"id": 3, "text": "Neutral", "value": 3},
    {"id": 4, "text": "Somewhat satisfied", "value": 4},
    {"id": 5, "text": "Very satisfied", "value": 5}
  ]', 'spiritual'
),
('How often do you feel at peace with yourself?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost always", "value": 5}
  ]', 'spiritual'
),
('How well do you practice gratitude in your daily life?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'spiritual'
),

-- Bhagavad Gita Specific (10 questions)
('How often do you practice detachment from outcomes?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost always", "value": 5}
  ]', 'gita'
),
('How well do you maintain equanimity in difficult situations?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'gita'
),
('How often do you act with selfless service (seva)?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost daily", "value": 5}
  ]', 'gita'
),
('How well do you balance action and inaction in your life?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'gita'
),
('How connected do you feel to your dharma (purpose)?', 
  '[
    {"id": 1, "text": "Not at all connected", "value": 1},
    {"id": 2, "text": "Slightly connected", "value": 2},
    {"id": 3, "text": "Moderately connected", "value": 3},
    {"id": 4, "text": "Very connected", "value": 4},
    {"id": 5, "text": "Extremely connected", "value": 5}
  ]', 'gita'
),
('How often do you practice self-discipline (tapas)?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost daily", "value": 5}
  ]', 'gita'
),
('How well do you control your senses and desires?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'gita'
),
('How often do you practice non-violence in thoughts and actions?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost always", "value": 5}
  ]', 'gita'
),
('How well do you maintain inner peace during challenges?', 
  '[
    {"id": 1, "text": "Very poorly", "value": 1},
    {"id": 2, "text": "Poorly", "value": 2},
    {"id": 3, "text": "Moderately well", "value": 3},
    {"id": 4, "text": "Well", "value": 4},
    {"id": 5, "text": "Very well", "value": 5}
  ]', 'gita'
),
('How often do you surrender your ego to a higher power?', 
  '[
    {"id": 1, "text": "Almost never", "value": 1},
    {"id": 2, "text": "Rarely", "value": 2},
    {"id": 3, "text": "Sometimes", "value": 3},
    {"id": 4, "text": "Often", "value": 4},
    {"id": 5, "text": "Almost always", "value": 5}
  ]', 'gita'
);

-- Sample data for mantras (expanded list of 50+ mantras)
INSERT INTO public.mantras (text, emotion_type, explanation) VALUES
-- Mantras for negative emotions (10)
('Karmanye vadhikaraste Ma Phaleshu Kadachana', 'negative', 'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Focus on your efforts, not the outcomes.'),
('Yogastha kuru karmani sangam tyaktva dhananjaya', 'negative', 'Perform your duties established in yoga, abandoning attachment, and be balanced in success and failure.'),
('Om Shanti Shanti Shantihi', 'negative', 'Peace, peace, peace. This mantra helps calm the mind and reduce stress by invoking peace at all levels of being.'),
('Tat Tvam Asi', 'negative', 'You are That. This mantra reminds us of our oneness with the universe and divine consciousness, helping to transcend negative emotions.'),
('Maha Mrityunjaya Mantra', 'negative', 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat. This powerful healing mantra helps overcome fear and negative emotions.'),
('Aham Brahmasmi', 'negative', 'I am Brahman. This mantra affirms your divine nature and helps transcend limiting beliefs and negative self-talk.'),
('Sarvesham Svastir Bhavatu', 'negative', 'May good health and wellbeing be unto all. This mantra promotes healing and wellness for all beings, helping shift focus from personal suffering.'),
('Om Namah Shivaya', 'negative', 'I bow to the inner self. This universal mantra helps balance all aspects of your being and dissolve negative emotions.'),
('Buddham Sharanam Gacchami', 'negative', 'I take refuge in the Buddha. This mantra helps find peace and clarity during difficult emotional states.'),
('Asato Ma Sad Gamaya', 'negative', 'Lead me from the unreal to the real. This mantra helps in seeking truth and clarity when clouded by negative emotions.'),

-- Mantras for neutral emotions (10)
('Samatvam yoga uchyate', 'neutral', 'Equanimity is called yoga. Maintain balance in both pleasure and pain, success and failure.'),
('So Hum', 'neutral', 'I am That. This mantra aligns with the natural rhythm of breathing and helps create a sense of balance and harmony.'),
('Om Gam Ganapataye Namaha', 'neutral', 'Salutations to Ganesha, the remover of obstacles. This mantra helps in overcoming challenges and finding balance.'),
('Ayam Atma Brahma', 'neutral', 'The Self is Brahman. This mantra affirms the unity of individual consciousness with universal consciousness.'),
('Prajnanam Brahma', 'neutral', 'Consciousness is Brahman. This mantra helps in developing higher awareness and wisdom.'),
('Om Tat Sat', 'neutral', 'That is the Truth. This mantra helps establish connection with the ultimate reality beyond fluctuating emotions.'),
('Hamsa Soham', 'neutral', 'I am That, That I am. This mantra helps maintain awareness of your true nature during breath meditation.'),
('Om Namo Bhagavate Vasudevaya', 'neutral', 'Salutations to Lord Vasudeva. This mantra helps establish devotion and surrender to the divine.'),
('Tvameva Mata Cha Pita Tvameva', 'neutral', 'You are my mother and father. This mantra invokes divine protection and guidance.'),
('Om Purnamadah Purnamidam', 'neutral', 'That is whole, this is whole. This mantra affirms the completeness of existence and helps establish contentment.'),

-- Mantras for positive emotions (10)
('Sukha-duhkhe same kritva labhalabhau jayajayau', 'positive', 'Be steadfast and treat happiness and distress, gain and loss, victory and defeat with equanimity.'),
('Aham Prema', 'positive', 'I am Divine Love. This mantra helps maintain your calm state and radiate positive energy to others.'),
('Lokah Samastah Sukhino Bhavantu', 'positive', 'May all beings everywhere be happy and free. This mantra cultivates compassion and goodwill toward all beings.'),
('Om Anandham', 'positive', 'Divine Bliss. This mantra helps connect with the inherent joy of existence.'),
('Soham Shivoham', 'positive', 'I am That, I am Shiva. This mantra affirms your divine nature and inherent bliss.'),
('Om Mani Padme Hum', 'positive', 'The jewel in the lotus. This mantra cultivates compassion and purifies negative emotions.'),
('Sat Chit Ananda', 'positive', 'Existence, Consciousness, Bliss. This mantra affirms the true nature of reality as blissful awareness.'),
('Om Shri Mahalakshmiyei Namaha', 'positive', 'Salutations to the Great Goddess Lakshmi. This mantra invokes abundance and prosperity.'),
('Sarve Bhavantu Sukhinah', 'positive', 'May all beings be happy. This mantra cultivates universal goodwill and positive intentions.'),
('Om Hreem Shreem Kleem', 'positive', 'This bija (seed) mantra invokes divine feminine energy and creative potential.'),

-- Mantras for very positive emotions (10)
('Ananda Hum', 'very_positive', 'I am Bliss. This mantra affirms your inherent nature as pure joy and bliss.'),
('Om Namah Bhagavate', 'very_positive', 'I bow to the Divine. This mantra cultivates devotion and surrender to the highest good.'),
('Shivo Hum', 'very_positive', 'I am Shiva (auspiciousness). This mantra affirms your divine nature as pure consciousness.'),
('Om Namo Narayanaya', 'very_positive', 'Salutations to Narayana. This mantra invokes divine protection and grace.'),
('Hare Krishna Hare Krishna, Krishna Krishna Hare Hare', 'very_positive', 'This mantra invokes divine love and joy through devotion to Krishna.'),
('Om Ananda Mayi', 'very_positive', 'O Divine Mother full of Bliss. This mantra connects with the blissful aspect of divine consciousness.'),
('Satchidananda Parabrahma', 'very_positive', 'The Supreme Reality is Existence-Consciousness-Bliss. This mantra affirms the ultimate nature of reality.'),
('Om Shanti Prashanti Param Shanti', 'very_positive', 'Peace, Higher Peace, Supreme Peace. This mantra invokes deepening levels of peace and bliss.'),
('Hari Om Tat Sat', 'very_positive', 'God is the absolute truth. This mantra affirms the divine nature of all existence.'),
('Om Poornamadah Poornamidam', 'very_positive', 'That is complete, this is complete. This mantra affirms the perfection and completeness of all existence.'),

-- Mantras for specific emotional states (20)
('Om Trayambakam Yajamahe', 'healing', 'We worship the three-eyed one (Shiva). This mantra promotes healing and longevity.'),
('Om Dhanvantre Namaha', 'healing', 'Salutations to the celestial physician. This mantra specifically invokes healing energy.'),
('Om Shanti Om', 'stress', 'Peace, Peace, Peace. A simple but powerful mantra to calm the mind during stress.'),
('Om Hrim Namah Shivaya', 'anxiety', 'I bow to Shiva with the seed of transformation. This mantra helps transform anxiety into calm awareness.'),
('Om Gam Ganapataye Namaha', 'obstacles', 'Salutations to Ganesha, the remover of obstacles. This mantra helps overcome challenges.'),
('Om Aim Saraswatyai Namaha', 'clarity', 'Salutations to Saraswati. This mantra invokes wisdom, clarity, and creative intelligence.'),
('Om Hreem Namah', 'transformation', 'I bow to the divine power of transformation. This mantra helps in deep personal transformation.'),
('Om Shrim Maha Lakshmiyei Namaha', 'abundance', 'Salutations to the Great Goddess Lakshmi. This mantra invokes abundance and prosperity.'),
('Om Krim Kalikayai Namaha', 'empowerment', 'Salutations to Kali. This mantra invokes inner strength and the power to overcome obstacles.'),
('Om Dum Durgayai Namaha', 'protection', 'Salutations to Durga. This mantra invokes divine protection and courage.'),
('Om Namo Bhagavate Vasudevaya', 'devotion', 'Salutations to Lord Vasudeva. This mantra cultivates devotion and surrender.'),
('Om Amriteshwaryai Namaha', 'immortality', 'Salutations to the Goddess of Immortal Nectar. This mantra invokes spiritual immortality.'),
('Om Ritam Satyam Param Brahma', 'truth', 'The Cosmic Order, Truth, and Supreme Reality. This mantra aligns with the highest truth.'),
('Om Sahana Vavatu', 'learning', 'May we be protected together. This mantra is for students and teachers to learn together harmoniously.'),
('Om Vasudheva Kutumbhakam', 'unity', 'The world is one family. This mantra cultivates a sense of universal kinship and unity.'),
('Om Sarva Mangala Mangalye', 'auspiciousness', 'O Auspicious One. This mantra invokes auspiciousness and blessings in all endeavors.'),
('Om Brahma Vishnu Maheshwara', 'cosmic_forces', 'Creator, Sustainer, Transformer. This mantra invokes balance of all cosmic forces.'),
('Om Tryambakam Yajamahe', 'transcendence', 'We worship the three-eyed one. This mantra helps transcend limitations and fear.'),
('Om Namo Narayanaya', 'surrender', 'Salutations to Narayana. This mantra cultivates complete surrender to the divine.'),
('Om Shrim Hreem Kleem Chamundayai Vicche', 'empowerment', 'This powerful mantra invokes the divine feminine energy for transformation and empowerment.');

-- Sample data for stories
INSERT INTO public.stories (theme, emotion_type, story_text) VALUES
('Overcoming Challenges', 'negative', 'Arjuna once faced a similar emotional state on the battlefield of Kurukshetra. Overwhelmed by conflicting emotions, he turned to Lord Krishna for guidance. Krishna taught him that emotions are temporary, but our true nature is eternal. By focusing on your duty without attachment to outcomes, you can find peace amidst emotional turbulence.'),
('Finding Balance', 'neutral', 'In the Bhagavad Gita, Krishna explains that balance is the key to a fulfilling life. When we neither cling to pleasure nor avoid pain, we find true equanimity. Like a steady lamp in a windless place, the mind becomes still and clear, allowing wisdom to shine through.'),
('Cultivating Joy', 'positive', 'Krishna teaches in the Gita that true joy comes not from external circumstances but from within. When we connect with our higher self through meditation and selfless action, we tap into an inexhaustible source of happiness that is independent of worldly gains and losses.'),
('Spiritual Growth', 'very_positive', 'The Bhagavad Gita describes the journey of spiritual growth as a gradual ascent, like climbing a mountain. Each step brings greater clarity and peace. Your current state reflects significant progress on this path. Continue your practices with devotion, and you will experience even deeper levels of fulfillment.');

-- Sample data for songs (50+ songs for different emotional states)
INSERT INTO public.songs (title, emotion_type, url) VALUES
-- Songs for negative emotions (10)
('Peaceful Meditation Music', 'negative', 'https://www.youtube.com/watch?v=lFcSrYw-ARY'),
('Calming Sitar and Flute', 'negative', 'https://www.youtube.com/watch?v=uxLh5Ak8UUQ'),
('Healing Sounds of Nature', 'negative', 'https://www.youtube.com/watch?v=eKFTSSKCzWA'),
('Om Chanting for Inner Peace', 'negative', 'https://www.youtube.com/watch?v=8sYK7lm3UKg'),
('Tibetan Singing Bowls for Stress Relief', 'negative', 'https://www.youtube.com/watch?v=wruCWicGBA4'),
('Relaxing Veena Music', 'negative', 'https://www.youtube.com/watch?v=XwhV1ivYNsQ'),
('Peaceful Bamboo Flute', 'negative', 'https://www.youtube.com/watch?v=fj2QTJKj8mE'),
('Soothing Ragas for Anxiety', 'negative', 'https://www.youtube.com/watch?v=Q2WBdxloW6k'),
('Calming Santoor Music', 'negative', 'https://www.youtube.com/watch?v=_B5N0IKJyGU'),
('Tranquil Forest Sounds with Bansuri', 'negative', 'https://www.youtube.com/watch?v=vLEek3I3wac'),

-- Songs for neutral emotions (10)
('Balanced Meditation Music', 'neutral', 'https://www.youtube.com/watch?v=9Flm8iZ8kMQ'),
('Harmonious Tabla and Sitar', 'neutral', 'https://www.youtube.com/watch?v=1xGmx4K81Hc'),
('Gentle Morning Ragas', 'neutral', 'https://www.youtube.com/watch?v=sKU7Qaf9wrw'),
('Peaceful Evening Melodies', 'neutral', 'https://www.youtube.com/watch?v=2LuGzwNy2Jw'),
('Balanced Chakra Sounds', 'neutral', 'https://www.youtube.com/watch?v=Aw71zanwMnY'),
('Mindful Awareness Music', 'neutral', 'https://www.youtube.com/watch?v=Dvqw8xFSZdQ'),
('Centered Breathing Meditation', 'neutral', 'https://www.youtube.com/watch?v=aXItOY0sLRY'),
('Equanimity Soundscape', 'neutral', 'https://www.youtube.com/watch?v=66VB6k4TwPk'),
('Balanced Energy Flow Music', 'neutral', 'https://www.youtube.com/watch?v=bRgI9zOPZEE'),
('Harmonious Nature Sounds', 'neutral', 'https://www.youtube.com/watch?v=eKFTSSKCzWA'),

-- Songs for positive emotions (10)
('Uplifting Morning Ragas', 'positive', 'https://www.youtube.com/watch?v=gMCjY5RDn4k'),
('Joyful Bhajans Collection', 'positive', 'https://www.youtube.com/watch?v=PHk2Ku9239o'),
('Energizing Tabla Rhythms', 'positive', 'https://www.youtube.com/watch?v=9OnLyJkj4Fc'),
('Positive Vibrations Music', 'positive', 'https://www.youtube.com/watch?v=IU13sdrLQ-M'),
('Cheerful Sitar Melodies', 'positive', 'https://www.youtube.com/watch?v=1xGmx4K81Hc'),
('Inspiring Vedic Chants', 'positive', 'https://www.youtube.com/watch?v=PHk2Ku9239o'),
('Motivational Mantras', 'positive', 'https://www.youtube.com/watch?v=9Flm8iZ8kMQ'),
('Joyful Flute Music', 'positive', 'https://www.youtube.com/watch?v=fj2QTJKj8mE'),
('Upbeat Devotional Songs', 'positive', 'https://www.youtube.com/watch?v=PHk2Ku9239o'),
('Positive Energy Meditation', 'positive', 'https://www.youtube.com/watch?v=IU13sdrLQ-M'),

-- Songs for very positive emotions (10)
('Ecstatic Kirtan Chants', 'very_positive', 'https://www.youtube.com/watch?v=PHk2Ku9239o'),
('Blissful Devotional Music', 'very_positive', 'https://www.youtube.com/watch?v=PHk2Ku9239o'),
('Joyous Celebration Rhythms', 'very_positive', 'https://www.youtube.com/watch?v=9OnLyJkj4Fc'),
('Transcendent Flute Melodies', 'very_positive', 'https://www.youtube.com/watch?v=fj2QTJKj8mE'),
('Ecstatic Dance Rhythms', 'very_positive', 'https://www.youtube.com/watch?v=9OnLyJkj4Fc'),
('Divine Bliss Meditation', 'very_positive', 'https://www.youtube.com/watch?v=9Flm8iZ8kMQ'),
('Euphoric Spiritual Music', 'very_positive', 'https://www.youtube.com/watch?v=IU13sdrLQ-M'),
('Radiant Joy Soundscape', 'very_positive', 'https://www.youtube.com/watch?v=IU13sdrLQ-M'),
('Exalted Devotional Chants', 'very_positive', 'https://www.youtube.com/watch?v=PHk2Ku9239o'),
('Blissful Awareness Music', 'very_positive', 'https://www.youtube.com/watch?v=9Flm8iZ8kMQ'),

-- Songs for specific emotional states (20)
('Healing Sounds for Recovery', 'healing', 'https://www.youtube.com/watch?v=wruCWicGBA4'),
('Restorative Meditation Music', 'healing', 'https://www.youtube.com/watch?v=lFcSrYw-ARY'),
('Stress Relief Soundscape', 'stress', 'https://www.youtube.com/watch?v=wruCWicGBA4'),
('Calming Anxiety Meditation', 'anxiety', 'https://www.youtube.com/watch?v=8sYK7lm3UKg'),
('Overcoming Obstacles Mantras', 'obstacles', 'https://www.youtube.com/watch?v=PHk2Ku9239o'),
('Clarity and Focus Music', 'clarity', 'https://www.youtube.com/watch?v=Dvqw8xFSZdQ'),
('Transformational Journey Sounds', 'transformation', 'https://www.youtube.com/watch?v=Aw71zanwMnY'),
('Abundance Meditation Music', 'abundance', 'https://www.youtube.com/watch?v=IU13sdrLQ-M'),
('Empowerment Rhythms', 'empowerment', 'https://www.youtube.com/watch?v=9OnLyJkj4Fc'),
('Protective Shield Meditation', 'protection', 'https://www.youtube.com/watch?v=wruCWicGBA4'),
('Devotional Bhajans Collection', 'devotion', 'https://www.youtube.com/watch?v=PHk2Ku9239o'),
('Immortal Soul Meditation', 'immortality', 'https://www.youtube.com/watch?v=9Flm8iZ8kMQ'),
('Truth Seeking Mantras', 'truth', 'https://www.youtube.com/watch?v=8sYK7lm3UKg'),
('Learning and Growth Music', 'learning', 'https://www.youtube.com/watch?v=Dvqw8xFSZdQ'),
('Unity Consciousness Sounds', 'unity', 'https://www.youtube.com/watch?v=Aw71zanwMnY'),
('Auspicious Beginnings Music', 'auspiciousness', 'https://www.youtube.com/watch?v=gMCjY5RDn4k'),
('Cosmic Connection Meditation', 'cosmic_forces', 'https://www.youtube.com/watch?v=Aw71zanwMnY'),
('Transcendence Journey Sounds', 'transcendence', 'https://www.youtube.com/watch?v=9Flm8iZ8kMQ'),
('Surrender and Release Music', 'surrender', 'https://www.youtube.com/watch?v=lFcSrYw-ARY'),
('Divine Feminine Energy Sounds', 'empowerment', 'https://www.youtube.com/watch?v=IU13sdrLQ-M');

-- Create storage bucket for ECG reports
-- Note: This needs to be done in the Supabase dashboard or via API
`;

// Function to initialize the database
export const initializeDatabase = async (): Promise<DatabaseResponse> => {
  try {
    // Execute the SQL to create tables
    const { error } = await supabase.rpc('exec_sql', { sql: createTables });
    
    if (error) {
      console.error("Error initializing database:", error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error initializing database:", error);
    return { success: false, error };
  }
};

// Function to check if tables exist
export const checkTablesExist = async (): Promise<boolean> => {
  try {
    // Try to query the questions table as a simple check
    const { data, error } = await supabase
      .from('questions')
      .select('id')
      .limit(1);
    
    if (error) {
      // If there's an error, tables might not exist
      console.error("Error checking tables:", error);
      return false;
    }
    
    // If we got data or an empty array without error, table exists
    return true;
  } catch (error) {
    console.error("Error checking tables:", error);
    return false;
  }
};

// Function to create tables via SQL in Supabase dashboard
export const getTableCreationInstructions = (): void => {
  if (Platform.OS === 'web') {
    console.log("Please go to your Supabase dashboard and run the SQL in the createTables variable from services/supabase.ts to set up the database schema.");
    return;
  }
  
  Alert.alert(
    "Database Setup Required",
    "Please go to your Supabase dashboard and run the SQL in the createTables variable from services/supabase.ts to set up the database schema. See the README.md file for detailed instructions.",
    [{ text: "OK" }]
  );
};

// Function to test Supabase connection
export const testSupabaseConnection = async (): Promise<DatabaseResponse> => {
  try {
    const { data, error } = await supabase.from('questions').select('count', { count: 'exact' });
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return { success: false, error };
  }
};

// Function to get random questions for assessment
export const getRandomQuestionsForAssessment = async (count = 10): Promise<DatabaseResponse> => {
  try {
    // Get all questions
    const { data, error } = await supabase
      .from('questions')
      .select('*');
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { success: false, error: "No questions found" };
    }
    
    // Ensure we have at least 10 questions
    const questionsCount = Math.min(count, 10); // Limit to 10 questions max
    const totalQuestions = data.length;
    
    // If we have fewer questions than requested, return all
    if (totalQuestions <= questionsCount) {
      return { success: true, data };
    }
    
    // Shuffle and select random questions
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, questionsCount);
    
    return { success: true, data: selected };
  } catch (error) {
    console.error("Error getting random questions:", error);
    return { success: false, error };
  }
};

// Function to get a random mantra based on emotion type
export const getRandomMantraForEmotionType = async (emotionType: EmotionType): Promise<MantraResponse> => {
  try {
    // First, validate the emotion type to ensure it's one of our defined types
    if (!isValidEmotionType(emotionType)) {
      // Default to neutral if invalid
      emotionType = 'neutral';
    }
    
    const { data, error } = await supabase
      .from('mantras')
      .select('*')
      .eq('emotion_type', emotionType);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      // If no mantras found for this emotion type, try to get a neutral one
      if (emotionType !== 'neutral') {
        return getRandomMantraForEmotionType('neutral');
      }
      return { success: false, error: "No mantras found for this emotion type" };
    }
    
    // Select a random mantra from the matching ones
    const randomIndex = Math.floor(Math.random() * data.length);
    const selectedMantra = data[randomIndex];
    
    return { success: true, data: selectedMantra };
  } catch (error) {
    console.error("Error getting random mantra:", error);
    // Return a default mantra as fallback
    return { 
      success: false, 
      error,
      data: {
        text: "Om Shanti Shanti Shantihi",
        explanation: "Peace, peace, peace. This mantra helps calm the mind and reduce stress by invoking peace at all levels of being."
      }
    };
  }
};

// Function to get a random song based on emotion type
export const getRandomSongForEmotionType = async (emotionType: EmotionType): Promise<SongResponse> => {
  try {
    // First, validate the emotion type to ensure it's one of our defined types
    if (!isValidEmotionType(emotionType)) {
      // Default to neutral if invalid
      emotionType = 'neutral';
    }
    
    // Fallback songs in case the database query fails
    const fallbackSongs = {
      negative: {
        title: "Peaceful Meditation Music",
        url: "https://www.youtube.com/watch?v=lFcSrYw-ARY"
      },
      neutral: {
        title: "Balanced Meditation Music",
        url: "https://www.youtube.com/watch?v=9Flm8iZ8kMQ"
      },
      positive: {
        title: "Uplifting Morning Ragas",
        url: "https://www.youtube.com/watch?v=gMCjY5RDn4k"
      },
      very_positive: {
        title: "Blissful Devotional Music",
        url: "https://www.youtube.com/watch?v=PHk2Ku9239o"
      }
    };
    
    // Try to get songs from the database
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('emotion_type', emotionType);
    
    if (error) {
      console.error("Database error getting song:", error);
      // Return a fallback song based on emotion type
      const fallbackType = emotionType in fallbackSongs ? emotionType : 'neutral';
      return { 
        success: true, 
        data: {
          title: fallbackSongs[fallbackType as keyof typeof fallbackSongs].title,
          url: fallbackSongs[fallbackType as keyof typeof fallbackSongs].url,
          emotion_type: fallbackType
        }
      };
    }
    
    if (!data || data.length === 0) {
      // If no songs found for this emotion type, try to get a neutral one
      if (emotionType !== 'neutral') {
        return getRandomSongForEmotionType('neutral');
      }
      
      // If still no songs, return a fallback
      return { 
        success: true, 
        data: {
          title: fallbackSongs.neutral.title,
          url: fallbackSongs.neutral.url,
          emotion_type: 'neutral'
        }
      };
    }
    
    // Select a random song from the matching ones
    const randomIndex = Math.floor(Math.random() * data.length);
    const selectedSong = data[randomIndex];
    
    return { success: true, data: selectedSong };
  } catch (error) {
    console.error("Error getting random song:", error);
    // Return a default song as fallback
    return { 
      success: true, 
      error,
      data: {
        title: "Peaceful Meditation Music",
        url: "https://www.youtube.com/watch?v=lFcSrYw-ARY",
        emotion_type: "neutral"
      }
    };
  }
};

// Helper function to validate emotion types
function isValidEmotionType(type: string): type is EmotionType {
  const validTypes: EmotionType[] = [
    'negative', 'neutral', 'positive', 'very_positive', 
    'healing', 'stress', 'anxiety', 'obstacles', 
    'clarity', 'transformation', 'abundance', 'empowerment', 
    'protection', 'devotion', 'immortality', 'truth', 
    'learning', 'unity', 'auspiciousness', 'cosmic_forces', 
    'transcendence', 'surrender'
  ];
  
  return validTypes.includes(type as EmotionType);
}