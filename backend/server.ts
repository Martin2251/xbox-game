import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import fs from 'fs'

import { GoogleGenerativeAI } from '@google/generative-ai'

import type { Request, Response } from 'express'
dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Fallback to local dev port
  methods: ["GET", "POST"]
}));
app.use(express.json());

// 1. Load your local games data
// Ensure games.json exists in your backend folder!
const gamesData = JSON.parse(fs.readFileSync('./games.json', 'utf-8'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * HELPER: Recursive Sanitizer
 * This goes through your JSON object and strips { and } from every string it finds.
 */
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
    // This is the "Hammer" that removes the curly braces
    return data.replace(/[{}]/g, '').trim();
  }
  return data;
};

app.post('/search', async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "No search query provided." });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an Xbox game expert. Based ONLY on the following list:
    ${JSON.stringify(gamesData)}

    USER REQUEST: "${query}"

    CRITICAL INSTRUCTIONS:
    - Pick the top 3 best matching games.
    - Return ONLY a valid JSON array.
    - Do NOT include any intro text, backticks, or "here is your result".
    - DO NOT wrap data in curly braces like {12 Hours}.
    - Use this exact structure: 
      [{"title": "...", "rating": "...", "duration": "...", "genre": "...", "description": "..."}]
  `;

  try {
    const result = await model.generateContent(prompt);
    let textResponse = result.response.text();

    // 1. Clean Markdown code blocks (```json ... ```)
    const cleanJsonString = textResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // 2. Parse the string into a real JavaScript object
    const rawParsed = JSON.parse(cleanJsonString);

    // 3. Run the recursive sanitizer to remove any stray { } characters
    const finalResults = sanitizeData(rawParsed);

    console.log("✅ Search successful for:", query);
    res.json(finalResults);
    
  } catch (error) {
    console.error("❌ Search Error:", error);
    // Send empty array so frontend doesn't crash on map()
    res.status(500).json([]);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`✅ Xbox API is live on port ${PORT}`);
});