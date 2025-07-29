import { useEffect, useState } from 'react';
import { Leaderboard } from './components/Leaderboard';
import type { Player } from './components/Leaderboard';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);

  // Load players from localStorage or fetch from /players.json
  useEffect(() => {
    const localPlayers = localStorage.getItem('millionaire-players');
    if (localPlayers) {
      setPlayers(JSON.parse(localPlayers));
    } else {
      fetch('/players.json')
        .then(res => res.json())
        .then((data: Player[]) => {
          setPlayers(data);
          localStorage.setItem('millionaire-players', JSON.stringify(data));
        });
    }
  }, []);

  // Update localStorage whenever players state changes
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem('millionaire-players', JSON.stringify(players));
    }
  }, [players]);

  // Example: function to update a player's money (call this from child components as needed)
  // const updatePlayerMoney = (id: string, newMoney: number) => {
  //   setPlayers(prev => prev.map(p => p.id === id ? { ...p, moneyEarned: newMoney } : p));
  // };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="flex justify-center items-center max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-100">
            Millionaire Leaderboard
          </h1>
        </div>
      </div>

      <Leaderboard
        players={players}
      />
    </div>
  );
}

export default App;
