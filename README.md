# Bhagavad Gita Wellness App

A holistic wellness application inspired by the teachings of the Bhagavad Gita, combining modern technology with ancient wisdom to promote mental, emotional, and spiritual well-being.

## Project Overview

This application offers:
- Wellness assessments based on Bhagavad Gita principles
- Facial emotion detection
- ECG analysis
- Personalized mantras, stories, and songs based on your emotional state
- Progress tracking for your wellness journey

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or newer)
- [Bun](https://bun.sh/) (recommended package manager)
- [Expo Go](https://expo.dev/client) app on your iOS or Android device for testing

## Installation

1. **Unzip the project folder** to your desired location

2. **Navigate to the project directory**
   ```bash
   cd bhagavad-gita-wellness-app
   ```

3. **Install dependencies**
   ```bash
   # Using Bun (recommended)
   bun install

   # Or using npm
   npm install

   # Or using yarn
   yarn install
   ```

## Running the Application

### Development Mode

```bash
# Start the development server with tunnel (for mobile device access)
bun start

# Start with web support
bun start-web

# Start web with debug mode
bun start-web-dev
```

### Testing on Your Device

1. Install the Expo Go app on your iOS or Android device
2. Scan the QR code displayed in your terminal after running `bun start`
3. The app will load on your device

### Testing on Web

After running `bun start-web`, open your browser to the URL displayed in the terminal (typically http://localhost:19006).

## Supabase Setup

This application uses Supabase for backend services. Follow these steps to set up your Supabase project:

### Step 1: Create a Supabase Project

1. Log in to your Supabase account (sign up at [supabase.com](https://supabase.com) if you don't have one)
2. Click "New Project"
3. Enter a name for your project
4. Set a secure database password
5. Choose a region closest to your users
6. Click "Create new project"

### Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to Project Settings > API
2. Find your **Project URL** and **anon/public** key
3. Keep these values handy for the next step

### Step 3: Update Your Project Configuration

1. Open `services/supabase.ts` in your project
2. Replace the placeholder values with your actual Supabase credentials:

```typescript
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";
```

### Step 4: Create Database Tables

You need to create the required database tables in Supabase. There are two ways to do this:

#### Option 1: Using the Supabase SQL Editor

1. In your Supabase dashboard, go to the SQL Editor
2. Create a new query
3. Copy the entire SQL script from the `createTables` variable in `services/supabase.ts`
4. Run the query

#### Option 2: Using the Migration Script in the App

1. Start your app
2. When prompted with "Database Setup Required" message, follow the instructions
3. Go to your Supabase dashboard and run the SQL script as directed

### Step 5: Enable Email Authentication

1. In your Supabase dashboard, go to Authentication > Providers
2. Make sure Email provider is enabled
3. Configure your email templates if desired

## Features

- **Wellness Assessment**: Answer questions based on Bhagavad Gita principles
- **Facial Emotion Detection**: Analyze your emotional state through your device's camera
- **ECG Analysis**: Upload ECG data for heart-based wellness insights
- **Personalized Content**: Receive mantras, stories, and songs tailored to your emotional state
- **Progress Tracking**: Monitor your wellness journey over time

## Troubleshooting

### Supabase Connection Issues

If you see "invalid credentials" error:

1. Verify your Supabase URL and anon key are correct in `services/supabase.ts`
2. Make sure you've created all the required tables using the SQL script
3. Check if the authentication provider (Email) is enabled in Supabase

### App Not Loading on Device

1. Ensure your mobile device and development machine are on the same network
2. Try using the tunnel option: `bun start --tunnel`
3. Verify Expo Go is up to date on your device

### Tables Not Created Error

If the app indicates tables are not created:

1. Go to your Supabase SQL Editor
2. Run the complete SQL script from `createTables` in `services/supabase.ts`
3. Verify the tables were created by checking the Table Editor

## Database Schema

The app uses the following tables:

- `questions`: Stores wellness assessment questions
- `user_responses`: Stores user responses to questions
- `face_analysis`: Stores results from facial emotion detection
- `ecg_reports`: Stores ECG analysis results
- `mantras`: Stores mantras for different emotional states
- `stories`: Stores stories related to different emotions
- `songs`: Stores songs for different emotional states

## Need Help?

If you continue to experience issues:

1. Check the Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
2. Verify your database tables are created correctly
3. Check the app logs for specific error messages