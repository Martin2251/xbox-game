import { useState, useTransition, Suspense, use } from 'react';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface XboxGame {
  title: string;
  rating: string;
  duration: string;
  genre: string;
  description: string;
}

// DATA FETCHING LOGIC
let searchPromise: Promise<XboxGame[]> | null = null;
let lastQuery = "";

function fetchGames(query: string): Promise<XboxGame[]> | null {
  if (!query) return null;
  if (query === lastQuery) return searchPromise;
  
  lastQuery = query;
  searchPromise = fetch(`${BACKEND_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  }).then(res => res.json());
  
  return searchPromise;
}

// SKELETON COMPONENT
const GameCardSkeleton = () => (
  <div className="game-card skeleton">
    <div className="skeleton-title" style={{ width: '70%', height: '24px', backgroundColor: '#333', marginBottom: '10px' }} />
    <div className="skeleton-line" style={{ width: '40%', height: '14px', backgroundColor: '#222', marginBottom: '20px' }} />
    <div className="skeleton-description" style={{ width: '100%', height: '60px', backgroundColor: '#222' }} />
  </div>
);

// RESULTS COMPONENT
function GameResults({ query }: { query: string }) {
  if (!query) return (
    <div className="empty-state">
      <p>Enter a game, genre, or even a "vibe" to begin...</p>
      <div className="vibe-suggestions">
        <span>Try: "Driving fast in Mexico"</span>
        <span>Try: "I want to be a space pirate"</span>
        <span>Try: "Games like Halo but with magic"</span>
      </div>
    </div>
  );
  
  const games: XboxGame[] = use(fetchGames(query)!);

  return (
    <div className="game-grid">
      {games.length === 0 && <p>No games found. Our AI is stumped! Try a different search.</p>}
      {games.map((game, index) => (
        <div key={index} className="game-card">
          <h3>{game.title}</h3>
          <div className="meta-info">
            <span>{game.genre}</span>
            <span>{game.rating}</span>
          </div>
          <p className="duration">⏳ {game.duration.replace(/[{}]/g, '')}</p>
          <p className="description">{game.description.replace(/[{}]/g, '')}</p>
        </div>
      ))}
    </div>
  );
}

// MAIN APP COMPONENT
export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    startTransition(() => {
      setActiveQuery(inputValue);
    });
  };

  return (
    <div className="App" style={{ opacity: isPending ? 0.8 : 1, transition: 'opacity 0.2s' }}>
      <header className="search-container">
        <div className="brand">
          <h1 style={{ color: '#107c10' }}>Xbox AI Search</h1>
          <span className="badge">Vector Powered</span>
        </div>

        {/* AI Insight Bar */}
        <div className="ai-insight">
          <p>
            ✨ <strong>Semantic Search Active:</strong> I find games based on 
            <em> meaning</em>, not just keywords. You can search for descriptions, 
            moods, or themes!
          </p>
        </div>

        <div className="input-group">
          <input 
            type="text" 
            placeholder="Describe a game... e.g. 'Scary game set in a forest'" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={isPending}>
            {isPending ? 'Connecting...' : 'Search'}
          </button>
        </div>

        {isPending && (
          <p className="cold-start-note">
            🚀 First search? Please wait ~60s for the server to wake up...
          </p>
        )}
      </header>

      <main>
        <Suspense fallback={
          <div className="game-grid">
            {[1, 2, 3].map(i => <GameCardSkeleton key={i} />)}
          </div>
        }>
          <GameResults query={activeQuery} />
        </Suspense>
      </main>
      
      <footer className="footer">
        <p>Powered by Gemini 2.5 Flash-Lite & Supabase Vector</p>
      </footer>
    </div>
  );
}