import { useState, useEffect } from 'react';
import GamePlayerCard from './GamePlayerCard';
import type { Player } from './Leaderboard';

interface AdminSettings {
    secret: boolean;
    winningPlayer?: string;
}

function Game() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [secret, setSecret] = useState<boolean>(true);
    const [winningPlayer, setWinningPlayer] = useState<string | undefined>(undefined);

    // Load admin settings from localStorage
    useEffect(() => {
        const adminSettings = localStorage.getItem('admin-settings');
        if (adminSettings) {
            try {
                const parsed: AdminSettings = JSON.parse(adminSettings);
                setSecret(parsed.secret !== undefined ? parsed.secret : true);
                setWinningPlayer(parsed.winningPlayer);
            } catch (error) {
                console.error('Error loading admin settings:', error);
                // If parsing fails, default to true
                setSecret(true);
            }
        } else {
            // If settings are missing, default to true
            setSecret(true);
        }

        // Listen for storage changes to update secret setting
        const handleStorageChange = () => {
            const adminSettings = localStorage.getItem('admin-settings');
            if (adminSettings) {
                try {
                    const parsed: AdminSettings = JSON.parse(adminSettings);
                    setSecret(parsed.secret !== undefined ? parsed.secret : true);
                    setWinningPlayer(parsed.winningPlayer);
                } catch (error) {
                    console.error('Error loading admin settings:', error);
                    setSecret(true);
                }
            } else {
                setSecret(true);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Load players from localStorage or fetch from /players.json
    useEffect(() => {
        const localPlayers = localStorage.getItem('millionaire-players');
        if (localPlayers) {
            try {
                const parsedPlayers = JSON.parse(localPlayers);
                setPlayers(parsedPlayers);
            } catch (error) {
                console.error('Error loading players from localStorage:', error);
                fetch('/players.json')
                    .then(res => res.json())
                    .then((data: Player[]) => {
                        setPlayers(data);
                        localStorage.setItem('millionaire-players', JSON.stringify(data));
                    });
            }
        } else {
            fetch('/players.json')
                .then(res => res.json())
                .then((data: Player[]) => {
                    setPlayers(data);
                    localStorage.setItem('millionaire-players', JSON.stringify(data));
                });
        }
    }, []);

    const handleUpdateInput = (playerId: string, newInput: string) => {
        setPlayers(prevPlayers => {
            const updatedPlayers = prevPlayers.map(player =>
                player.id === playerId
                    ? { ...player, playerInput: newInput }
                    : player
            );
            // Update localStorage
            localStorage.setItem('millionaire-players', JSON.stringify(updatedPlayers));
            return updatedPlayers;
        });
    };

    return (
        <div className="w-full mx-auto p-6">
            <div className="flex flex-col items-center gap-6">
                {players.map((player) => (
                    <GamePlayerCard
                        key={player.id}
                        playerId={player.id}
                        type={player.type}
                        names={player.names}
                        playerInput={player.playerInput || ''}
                        avatarUrl={player.avatarUrl}
                        teamAvatarUrl={player.teamAvatarUrl}
                        onUpdateInput={handleUpdateInput}
                        readOnly={true}
                        maskValue={secret}
                        isWinner={!secret && winningPlayer === player.id}
                    />
                ))}
            </div>

            {players.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No players found</p>
                </div>
            )}
        </div>
    );
}

export { Game };
