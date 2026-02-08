import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
// Removed fs since we are no longer reading games.json
import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Request, Response } from 'express'

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"]
}));

app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!, 
  process.env.SUPABASE_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const sanitizeData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  } else if (data !== null && typeof data === 'object') {
    const cleanObj: any = {};
    for (const key in data) {
      cleanObj[key] = sanitizeData(data[key]);
    }
    return cleanObj;
  } else if (typeof data === 'string') {
    return data.replace(/[{}]/g, '').trim();
  }
  return data;
};

app.post('/search', async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "No search query provided." });
  }

  try {
    // 1. Fetch the latest game catalog from your Supabase 'games' table
    const { data: gamesData, error: dbError } = await supabase
      .from('games')
      .select('title, rating, duration, genre, description');

    if (dbError || !gamesData) {
      console.error("❌ Supabase Fetch Error:", dbError);
      throw new Error("Could not retrieve game data from database.");
    }

    // 2. Pass the dynamic database data to Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an Xbox game expert. Based ONLY on the following list from my database:
      ${JSON.stringify(gamesData)}

      USER REQUEST: "${query}"

      CRITICAL INSTRUCTIONS:
      - Pick the top 3 best matching games.
      - Return ONLY a valid JSON array.
      - Do NOT include any intro text or backticks.
      - DO NOT wrap data in curly braces like {12 Hours}.
      - Structure: [{"title": "...", "rating": "...", "duration": "...", "genre": "...", "description": "..."}]
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    const cleanJsonString = textResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const rawParsed = JSON.parse(cleanJsonString);
    const finalResults = sanitizeData(rawParsed);

    console.log("✅ Search successful via Supabase for:", query);
    res.json(finalResults);
    
  } catch (error) {
    console.error("❌ Search/DB Error:", error);
    res.status(500).json([]);
  }
});

// Added a simple health check route for Render
app.get('/', (req, res) => {
  res.send('Xbox Game Backend is Running');
});

const PORT = process.env.PORT || 3001;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`✅ Xbox API is live on port ${PORT}`);
});