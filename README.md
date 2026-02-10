🎮 Xbox Game Search Engine
A full-stack TypeScript application that uses Google Gemini 2.5 Flash-Lite and Vector Embeddings to perform semantic searches on a live Supabase database.

[!IMPORTANT] User Note: If you are searching for a game for the first time, the initial request may take about 60 seconds. This is due to a "cold start" on Render's free hosting tier. Subsequent searches will be much faster.

🚀 The Tech Stack
Frontend: React 19, Vite, TypeScript, CSS Grid (Xbox Theme).

Backend: Node.js, Express, tsx.

AI (Reasoning): Google Gemini 2.5 Flash-Lite (Optimized for speed/free quota).

AI (Embeddings): gemini-embedding-001 (3072-dimensional vectors).

Database: Supabase (PostgreSQL) + pgvector extension.

Hosting: Render (Backend) & Vercel (Frontend).

🛠 Step 1: Supabase Setup (Vector Engine)
Enable Vector Extension: In your Supabase SQL Editor, run:

SQL
create extension if not exists vector;
Create Game Catalog: Use the SQL Editor to create the library with the embedding column:

SQL
create table games (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  genre text,
  rating text,
  duration text,
  description text,
  embedding vector(3072) -- Specifically for gemini-embedding-001
);
Create the Search Function (RPC):

SQL
create or replace function match_games (
  query_embedding vector(3072),
  match_threshold float,
  match_count int
)
returns setof games
language sql stable
as $$
  select *
  from games
  where games.embedding <=> query_embedding < 1 - match_threshold
  order by games.embedding <=> query_embedding asc
  limit match_count;
$$;
🚄 Step 2: Render Setup (Backend Hosting)
Connect GitHub: Deploy your backend folder to Render.com.

Environment Variables: In the Render dashboard, add:

GEMINI_API_KEY: (Your key from Google AI Studio)

SUPABASE_URL: (Your project URL)

SUPABASE_KEY: (Your anon public key)

FRONTEND_URL: https://xbox-game.vercel.app

PORT: 10000 (Render's default) or 3001.

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
[x] Semantic Vector Search: Uses gemini-embedding-001 to find games based on "vibes" and context (e.g., searching "Mexico" finds Forza Horizon 5).

[x] Generous Free Tier: Optimized with Gemini 2.5 Flash-Lite to allow for high request volume without hitting API limits.

[x] Xbox UI: Fully responsive grid with "pop-out" hover effects and Xbox-inspired design.

[x] Type-Safe: Built with strict TypeScript, including verbatimModuleSyntax for clean builds.

🗺 Future Roadmap
[ ] Speed Boost: Implement an HNSW index with halfvec(3072) to speed up searches as the library grows.

[ ] Favorites Logic: Allow users to save games to a personal collection.

[ ] Auth Integration: Connect Supabase Auth for persistent user profiles.