import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: [process.env.FRONTEND_URL, 'http://localhost:5173'] }));
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

app.post('/search', async (req: Request, res: Response) => {
  const { query } = req.body;

  try {
    // 1. EMBEDDING (FREE & STABLE)
    // Uses gemini-embedding-001 (Generous quota for vectors)
    const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const embRes = await embedModel.embedContent(query);
    const vector = embRes.embedding.values;

    // 2. VECTOR SEARCH
    const { data: matchedGames, error } = await supabase.rpc('match_games', {
      query_embedding: vector,
      match_threshold: 0.3,
      match_count: 5
    });

    if (error) throw error;

    // 3. GENERATIVE RESPONSE (MOST GENEROUS FREE MODEL)
    // Switching to 'gemini-2.5-flash-lite' for 1,000 requests/day
    const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const prompt = `
      User Query: "${query}"
      Data: ${JSON.stringify(matchedGames)}
      Task: Return only a JSON array of these games. Format: [{title, genre, rating, duration, description}].
    `;

    const result = await chatModel.generateContent(prompt);
    const cleanedJson = result.response.text().replace(/```json|```/g, '').trim();

    res.json(JSON.parse(cleanedJson));
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json([]);
  }
});

app.listen(PORT, () => console.log(`🚀 Generous API live on port ${PORT}`));