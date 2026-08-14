# Fishbowl - AI Gmail Assistant

Fishbowl is an intelligent, automated Gmail Assistant built with Next.js, Google Cloud (Gmail API), and Google DeepMind's Gemini API. It actively scans your inbox, classifies emails using advanced AI, and organizes them based on highly personalized rules. It features a beautiful dashboard and a fully automated daily cron job that runs in the background.

## Features
- **AI Classification**: Uses `gemini-3.5-flash-lite` to rapidly classify incoming emails into `JUNK`, `IMPORTANT`, `REVIEW`, and `QUEUE`.
- **Automated Trashing**: Automatically moves promotional, spam, and marketing emails straight to the trash.
- **Smart Labeling**: Automatically applies custom colored labels (`AI_PROCESSED` in blue, `AI_REVIEW` in orange, `Queue` in red) to your emails so you can easily visually parse your inbox.
- **Delayed Deletion Queue**: Event rejection emails are tagged and held in a red `Queue` for 24 hours before being automatically deleted by the background system.
- **Daily Automation**: Uses a secure Vercel Cron Job to silently clean the inbox every day at 9:00 PM without requiring manual intervention.
- **Multi-user Support**: Log in with any Google account; the AI will securely clean the active user's inbox based on the configured rules.

---

## ⚠️ Important Note on Personalization
This repository contains **highly personalized classification rules** tailored specifically for the original author. The AI is explicitly instructed to look out for specific organizations (e.g., Rotary International, GDG Bangalore, Supabase, Internshala). 

**If you fork or clone this repository, you MUST modify the system prompt in `src/lib/gemini.ts` to match your own personal interests, job applications, and junk criteria.**

### Current AI Rules (Example)
- **IMPORTANT**: Career-related emails, interview scheduling, GDG Bangalore/tech event confirmations, Rotary International/Rotaract emails, and Supabase infrastructure alerts.
- **JUNK (Auto-Trashed)**: Marketing blasts (Kaggle, Indigo, Adobe, Internshala), LinkedIn/Indeed daily posts, OTPs, verification codes, Pinterest spam, and welcome emails.
- **QUEUE (24h Delayed Trash)**: "Registration not accepted" or application declined emails.
- **REVIEW**: Borderline/uncertain emails from human senders.

---

## Setup & Installation

### 1. Google Cloud Platform (Gmail API & OAuth)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Navigate to **APIs & Services > Library** and enable the **Gmail API**.
4. Go to **APIs & Services > OAuth consent screen**:
   - Choose **External**.
   - Fill out the required app information.
   - **Crucial**: Under "Publishing status", click **Publish App** to push it to "In production". If you leave it in "Testing", your refresh tokens will expire every 7 days!
5. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (and your production URL).
6. Copy your `Client ID` and `Client Secret`.

### 2. Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Generate an API Key for Gemini.

### 3. Environment Variables
Create a `.env.local` file in the root of your project:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=generate_a_random_secure_string
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
CRON_SECRET=create_a_secure_password_for_cron
```

### 4. Getting the Permanent Refresh Token
For the 9 PM background automation to run without you being logged in, the system needs an offline refresh token.
1. Run the local server: `npm run dev`
2. Open `http://localhost:3000` and click **Sign in with Google**.
3. (If Google warns you the app is unverified, click "Advanced" -> "Go to App").
4. Check your VS Code terminal! The NextAuth callback is configured to print your permanent `GOOGLE_REFRESH_TOKEN` directly into the terminal upon first login.
5. Add that token to your `.env.local` (and Vercel Environment Variables):
```env
GOOGLE_REFRESH_TOKEN=1//your_super_long_refresh_token
```

### 5. Deployment & Automation
1. Deploy the project to [Vercel](https://vercel.com).
2. Ensure all environment variables are copied into Vercel Settings.
3. The `vercel.json` file is already configured to trigger `/api/cron` at the scheduled time using the `CRON_SECRET`.

---

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Auth**: NextAuth.js
- **Styling**: Vanilla CSS Modules (Glassmorphism UI)
- **APIs**: Google APIs Node.js Client, Google Generative AI SDK
