import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

async function run() {
  const { data: games } = await supabase.from('games').select('id, title, description');
  
  for (const game of games || []) {
    console.log(`Embedding: ${game.title}...`);
    const result = await model.embedContent(`${game.title} ${game.description}`);
    await supabase.from('games').update({ embedding: result.embedding.values }).eq('id', game.id);
  }
  console.log("✅ Database is now Vector-Ready!");
}
run();