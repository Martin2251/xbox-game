import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- 1. CONFIGURATION ---

// Allow your Vercel frontend and local testing
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Initialize Supabase & Gemini
const supabase = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_KEY! // Uses the 'anon public' key
);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- 2. THE SEARCH ROUTE (VECTOR SEARCH) ---

app.post('/search', async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    console.log(`🔍 Searching for: "${query}"`);

    // STEP A: Generate Vector Embedding for the search query
    // We use gemini-embedding-001 to match our database records
    const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const embResult = await embedModel.embedContent(query);
    const queryVector = embResult.embedding.values;

    // STEP B: Search Supabase using the match_games RPC function
    const { data: matchedGames, error: dbError } = await supabase.rpc('match_games', {
      query_embedding: queryVector,
      match_threshold: 0.3, // 0.3 = broad search, 0.7 = very strict
      match_count: 5        // Return top 5 games
    });

    if (dbError) throw dbError;

    // STEP C: Use Gemini 2.5 Flash to rank and "talk" about these results
    const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      You are an Xbox expert. The user is looking for: "${query}".
      Below are the most relevant games found in our database:
      ${JSON.stringify(matchedGames)}

      Task: Based on these results, return a clean JSON array of games.
      If a game doesn't strictly fit what the user asked, you can exclude it.
      Return ONLY the JSON array.
    `;

    const aiResult = await chatModel.generateContent(prompt);
    const aiText = aiResult.response.text();
    
    // Clean up the response (remove markdown if Gemini adds it)
    const cleanedJson = aiText.replace(/```json|```/g, '').trim();
    
    console.log("✅ Search successful!");
    res.json(JSON.parse(cleanedJson));

  } catch (err) {
    console.error("❌ Search/Vector Error:", err);
    res.status(500).json({ error: "Failed to process search" });
  }
});

// --- 3. HEALTH CHECK ---
app.get('/', (req, res) => {
  res.send('🎮 Xbox API is Live (Render + Supabase + Vector)');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});