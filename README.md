🎮 Xbox Game Search Engine
A full-stack TypeScript application that uses Gemini 2.5 Flash to search a local game library and Supabase to store persistent data.

🚀 The Tech Stack
Frontend: React 19, Vite, TypeScript, CSS Grid (Xbox Theme).

Backend: Node.js, Express, tsx.

AI: Google Gemini 2.5 Flash (Free Tier).

Database: Supabase (PostgreSQL).

Hosting: Railway (Backend) & Vercel (Frontend).

🛠 Step 1: Supabase Setup (Database)
Create Account: Go to Supabase.com and create a new project.

Get Credentials: In your project settings, go to API and copy your Project URL and anon public key.

Create Table: Go to the SQL Editor in Supabase and run this to create a table for user favorites:

SQL
create table favorite_games (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  game_title text not null,
  genre text,
  user_id uuid default auth.uid() -- Optional: for when you add logins
);
🚄 Step 2: Railway Setup (Backend Hosting)
Railway will host your Node.js server.

Push to GitHub: Ensure your project is in a GitHub repository.

Connect Railway: Login to Railway.app and click "New Project" -> "Deploy from GitHub repo".

Variables: In the Railway dashboard for your service, go to Variables and add:

GEMINI_API_KEY: (Your key from Google AI Studio)

PORT: 3001

Networking: Railway will give you a public URL (e.g., https://backend-production.up.railway.app). Copy this.

💻 Step 3: Local Environment Variables
Create a .env file in your backend folder and a .env.local in your frontend folder.

Backend .env:

Plaintext
GEMINI_API_KEY=your_google_key
PORT=3001
Frontend .env.local:

Plaintext
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=https://your-railway-url.up.railway.app
🏃 Step 4: Installation & Running
Backend
Bash
cd backend
npm install
npm run dev # Starts with tsx watch
Frontend
Bash
cd frontend
npm install
npm run dev # Starts Vite
📝 Important Deployment Notes
CORS: In your server.ts, make sure you allow your Vercel URL:

TypeScript
app.use(cors({ origin: "https://your-app.vercel.app" }));
Supabase Client: Use the createClient function in your React app to connect to the database.

🎨 Features
[x] AI Search: Natural language searching via Gemini.

[x] Xbox UI: Responsive grid with "pop-out" hover effects.

[x] Bulletproof Sanitization: Automatically removes {} from LLM responses.

[x] Nice Suspense: React 19 useTransition and Suspense for smooth loading.
