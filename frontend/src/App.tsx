import './App.css';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, use, useState, useTransition } from 'react';

// 1. DATA FETCHING LOGIC (Must be outside the component to avoid re-creation)
// In a real 2026 app, you'd use TanStack Query, but here is the raw 'use' pattern.
let searchPromise: Promise<any> | null = null;
let lastQuery = "";

function fetchGames(query: string) {
  if (query === lastQuery) return searchPromise;
  lastQuery = query;
  searchPromise = fetch('http://localhost:3001/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  }).then(res => res.json());
  return searchPromise;
}

// 2. SKELETON COMPONENT (The "Nice" part of Suspense)
const GameCardSkeleton = () => (
  <div className="game-card skeleton">
    <div className="skeleton-title" style={{ width: '70%', height: '24px', backgroundColor: '#333', marginBottom: '10px' }} />
    <div className="skeleton-line" style={{ width: '40%', height: '14px', backgroundColor: '#222', marginBottom: '20px' }} />
    <div className="skeleton-description" style={{ width: '100%', height: '60px', backgroundColor: '#222' }} />
  </div>
);

// 3. RESULTS COMPONENT (Suspends while waiting)
function GameResults({ query }: { query: string }) {
  if (!query) return <p style={{ textAlign: 'center', color: '#666' }}>Enter a game or genre to begin...</p>;
  
  // The 'use' hook tells React to suspend this component until searchPromise resolves
  const games = use(fetchGames(query)!);

  return (
    <div className="game-grid">
   
      {games.map((game: any, index: number) => (
        <div key={index} className="game-card">
          <h3>{game.title}</h3>
          <div className="meta-info">
            <span>{game.genre}</span>
            <span>{game.rating}</span>
          </div>
          <p className="duration">⏳ {game.duration}</p>
          <p className="description">{game.description}</p>
        </div>
      ))}
    </div>
  );
}

// 4. MAIN APP COMPONENT
export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    // startTransition keeps the current results visible while the new ones load
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
        {/* Suspense catches the promise from the 'use' hook in GameResults */}
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