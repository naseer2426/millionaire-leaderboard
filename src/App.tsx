import { useEffect, useState } from 'react';
import { Leaderboard } from './components/Leaderboard';
import { Game } from './components/Game';
import { Admin } from './components/Admin';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import type { Player } from './components/Leaderboard';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);

  // Check for admin query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowAdmin(params.get('admin') === 'naseer');
  }, []);

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

      <div className="max-w-6xl mx-auto px-6 py-6">
        <Tabs defaultValue="leaderboard" className="w-full">
          <div className="flex justify-center mb-4">
            <TabsList>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="game">Game</TabsTrigger>
              {showAdmin && (
                <TabsTrigger value="admin" variant="danger">Admin</TabsTrigger>
              )}
            </TabsList>
          </div>
          <TabsContent value="leaderboard">
            <Leaderboard
              players={players}
            />
          </TabsContent>
          <TabsContent value="game">
            <Game />
          </TabsContent>
          {showAdmin && (
            <TabsContent value="admin">
              <Admin />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

export default App;
