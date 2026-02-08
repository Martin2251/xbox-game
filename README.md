
🎮 Xbox Game Search Engine
A full-stack TypeScript application that uses Google Gemini 2.5 Flash to search a live Supabase database with a custom Xbox-inspired UI.

🚀 The Tech Stack
Frontend: React 19, Vite, TypeScript, CSS Grid (Xbox Theme).

Backend: Node.js, Express, tsx.

AI: Google Gemini 2.5 Flash (via Google AI SDK).

Database: Supabase (PostgreSQL) — Hosts the game catalog and user data.

Hosting: Render (Backend) & Vercel (Frontend).

🛠 Step 1: Supabase Setup (The Brain)
Create Project: Create a project at Supabase.com.

Create Game Catalog: Use the SQL Editor to create your main library:

SQL
create table games (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  genre text,
  rating text,
  duration text,
  description text
);
Create Favorites Table:

SQL
create table favorites (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  title text not null
);
🚄 Step 2: Render Setup (Backend Hosting)
Connect GitHub: Deploy your backend folder to Render.com.

Environment Variables: In the Render dashboard, add:

GEMINI_API_KEY: (Your key from Google AI Studio)

SUPABASE_URL: (Your project URL)

SUPABASE_KEY: (Your anon public key)

FRONTEND_URL: https://xbox-game.vercel.app

PORT: 3001

💻 Step 3: Local Environment Variables
Create a .env file in your backend folder:

Plaintext
GEMINI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
FRONTEND_URL=http://localhost:5173
PORT=3001
🏃 Step 4: Installation & Running
Backend

Bash
cd backend
npm install
npm run dev
Frontend

Bash
cd frontend
npm install
npm run dev
📝 Key Features
[x] Live DB Search: The AI reads directly from your Supabase games table.

[x] Next-Gen AI: Uses Gemini 2.5 Flash for PhD-level reasoning and faster multimodal processing.

[x] Xbox UI: Fully responsive grid with "pop-out" hover effects.

[x] Sanitized Responses: Custom recursive cleaner to remove stray {} or Markdown from AI outputs.