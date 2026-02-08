import { useState, useTransition, Suspense, use } from 'react';
import './App.css';

// 1. DYNAMIC URL SETUP
// Vite looks for VITE_BACKEND_URL in your Vercel settings.
// If it doesn't find it, it defaults to localhost (for your dev work).
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

interface XboxGame {
  title: string;
  rating: string;
  duration: string;
  genre: string;
  description: string;
}

// 2. DATA FETCHING LOGIC
let searchPromise: Promise<XboxGame[]> | null = null;
let lastQuery = "";

function fetchGames(query: string): Promise<XboxGame[]> | null {
  if (!query) return null;
  if (query === lastQuery) return searchPromise;
  
  lastQuery = query;
  // Use the dynamic BACKEND_URL variable here
  searchPromise = fetch(`${BACKEND_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  }).then(res => res.json());
  
  return searchPromise;
}

// 3. SKELETON COMPONENT
const GameCardSkeleton = () => (
  <div className="game-card skeleton">
    <div className="skeleton-title" style={{ width: '70%', height: '24px', backgroundColor: '#333', marginBottom: '10px' }} />
    <div className="skeleton-line" style={{ width: '40%', height: '14px', backgroundColor: '#222', marginBottom: '20px' }} />
    <div className="skeleton-description" style={{ width: '100%', height: '60px', backgroundColor: '#222' }} />
  </div>
);

// 4. RESULTS COMPONENT
function GameResults({ query }: { query: string }) {
  if (!query) return <p style={{ textAlign: 'center', color: '#666' }}>Enter a game or genre to begin...</p>;
  
  const games: XboxGame[] = use(fetchGames(query)!);

  return (
    <div className="game-grid">
      {games.length === 0 && <p>No games found. Try a different search!</p>}
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

// 5. MAIN APP COMPONENT
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
    
    <div className="App" style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s' }}>
      <header className="search-container">
        <h1 style={{ color: '#107c10' }}>Xbox Search</h1>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Search e.g. 'Fast paced shooters'" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={isPending}>
            {isPending ? 'Connecting...' : 'Search'}
          </button>
        </div>
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
    </div>
  );
}