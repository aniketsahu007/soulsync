<div align="center">
  <img src="public/logo.png" alt="SoulSync Logo" width="180" height="180" />

  # SoulSync: India Resilience Hub 🇮🇳

  ### Empowering students through anonymous peer support, AI-assisted resilience tools, and governance-safe volunteer handoff.

  [![SamaSocial Build for Good](https://img.shields.io/badge/SamaSocial-Build%20for%20Good-FF5A5F?style=for-the-badge&logo=rethinking&logoColor=white)](https://www.samasocial.in/hackathon/build-for-good)
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![OpenRouter](https://img.shields.io/badge/OpenRouter-4A90E2?style=for-the-badge&logo=openai&logoColor=white)](https://openrouter.ai/)

  [**Watch Demo**](#) • [**Live Prototype**](#) • [**Pitch Deck**](#)
</div>

---

## Overview
SoulSync is a hackathon-ready resilience platform built for Indian students. It combines anonymous peer support, AI-context awareness, and interactive resilience tools with a dedicated Wellness Hub to help students manage stress, prevent burnout, and access support without logging in.

This project is designed for the **SamaSocial Build for Good hackathon** and prioritizes impact, privacy, and a seamless student experience.

---

## Why SoulSync Wins
- **Zero-trace student support:** anonymous aliasing and local identity persistence keep students safe while enabling useful session continuity.
- **Warm, non-clinical AI support:** the chatbot uses custom prompts to stay empathetic, grounded, and student-friendly.
- **Volunteer-ready handoff:** AI-generated chat summaries and briefing content give volunteers context without exposing identity.
- **Evidence-based resilience tools:** breathing, grounding, HALT diagnostics, journaling, habits, and mood tracking support both immediate relief and long-term growth.
- **Governance-first architecture:** Supabase RLS, volunteer verification, and admin workflows secure the platform for campus deployment.

---

## Key Features

### 1. Anonymous Peer Support
- **Chat support** at `/chat` with AI-backed emotional insight and session persistence.
- **Peer matching** at `/peer-match` connects students with verified volunteers while preserving anonymity.
- **Volunteer briefing** via AI-generated summaries that give volunteers accurate, actionable context.

### 2. Resilience Toolkit
- **Breathing Visualizer:** guided breathing exercises for immediate calm.
- **Grounding Journey:** sensory grounding practices for emotional stabilization.
- **HALT Diagnostic:** coaching for Hunger, Anger, Loneliness, and Tiredness.
- **Reflection Pad:** zero-trace journaling for safe emotional processing.
- **Wellness Hub:** habit and focus management tools for behavioral resilience.

### 3. Safety and AI Intelligence
- **Emotion detection** in-browser via RoBERTa (`SamLowe/roberta-base-go_emotions`) using `@xenova/transformers`.
- **OpenRouter chat completions** for empathetic peer-style conversation.
- **Safe onboarding pipelines** for volunteers and admins, including CV verification and RLS-backed governance.

---

## Architecture & Technology Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for responsive styling
- **TanStack Router** for file-based, type-safe routing
- **Framer Motion** for polished motion design

### Backend & Data
- **Supabase** for Postgres, Auth, Storage, and security policies
- **Supabase RLS** for row-level access control
- **Supabase migrations** for schema and governance logic in `supabase/migrations`

### AI & Models
- **OpenRouter** for configurable chat completions
- **RoBERTa emotion classifier** for live sentiment detection
- **Custom prompt engineering** for empathetic, humanized chatbot behavior

---

## App Navigation

### Student Experience
- `/` — Landing page and introduction
- `/check-in` — Daily check-in and HALT diagnostic
- `/mood-tracker` — Emotional trends and mood history
- `/peer-match` — Anonymous volunteer connect
- `/chat` — Real-time support chat
- `/resources` — Wellness Hub (resilience toolkit)
- `/community-qna` — Anonymous community support
- `/partners` — NGO partners and support network

### Volunteer & Admin Experience
- `/volunteer` — Volunteer onboarding and application
- `/volunteer/dashboard` — Volunteer workspace and AI briefing center
- `/admin` — Admin portal for governance
- `/admin/volunteers` — Volunteer verification and status management
- `/admin/command-center` — Crisis visibility and system monitoring

---

## Project Structure

```text
soulsync/
├── src/
│   ├── components/             # Reusable UI and page components
│   │   ├── admin/              # Admin portal components
│   │   ├── resilience-tools/   # Breathing, grounding, HALT, reflection tools
│   │   ├── ui/                 # Shared UI primitives (button, dialog, input)
│   │   ├── volunteer/          # Volunteer dashboard components
│   │   └── ChatInterface.tsx   # Core anonymous support interface
│   ├── routes/                 # Page-level routes with TanStack Router
│   │   ├── admin/              # Admin pages
│   │   ├── api/                # Server-side endpoints
│   │   └── volunteer/          # Volunteer workflow pages
│   ├── integrations/           # Supabase client and auth middleware
│   ├── hooks/                  # Custom hooks (useAnonymousIdentity, use-mobile)
│   └── styles.css              # Global styles
├── supabase/
│   └── migrations/             # SQL schema and RLS migrations
├── package.json
└── vite.config.ts
```

---

## Setup & Installation

### Prerequisites
- Node.js 20+ / npm 10+
- Supabase project
- OpenRouter API key

### Install
```bash
git clone https://github.com/your-org/soulsync.git
cd soulsync
npm install
```

### Configure
Create a `.env` file in the root directory and add:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-oss-120b:free
```

### Run locally
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

---

## Strengths
- **Student-first impact:** directly addresses campus mental health and stigma with peer-led support.
- **Privacy-first design:** anonymous identity, zero-trace journaling, and strict governance.
- **AI-enabled support:** helpful context, emotional insight, and volunteer briefing support without replacing human care.
- **Lean, scalable architecture:** modern React + Supabase stack built for fast deployment and iterative testing.
- **Presentation-ready polish:** UX clarity, motion, and storytelling designed for judges.

---

## Notes
- The app is intentionally built to feel safe, supportive, and accessible.
- Supabase migrations in `supabase/migrations` define the production schema and security model.
- The chat experience is guided by a custom warm system prompt and emotion-aware AI context.

<div align="center">
  <strong>SoulSync is built to win: secure, empathetic, and ready to scale student resilience across campuses.</strong>
</div>
