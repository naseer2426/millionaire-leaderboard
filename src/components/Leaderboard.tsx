import React, { useState, useEffect } from 'react';
import PlayerCard from './PlayerCard';

export interface Player {
    id: string;
    type: 'single' | 'team';
    names: string[];
    moneyEarned: number;
    rank?: number;
    avatarUrl?: string;
    teamAvatarUrl?: string;
    playerInput?: string;
}

interface LeaderboardProps {
    players: Player[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players: initialPlayers }) => {
    const [players, setPlayers] = useState<Player[]>(initialPlayers);
    const [sortedPlayers, setSortedPlayers] = useState<Player[]>([...initialPlayers].sort((a, b) => b.moneyEarned - a.moneyEarned));
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

    // Load players from localStorage on component mount
    useEffect(() => {
        const savedPlayers = localStorage.getItem('millionaire-players');
        if (savedPlayers) {
            try {
                const parsedPlayers = JSON.parse(savedPlayers);
                setPlayers(parsedPlayers);
                setSortedPlayers([...parsedPlayers].sort((a, b) => b.moneyEarned - a.moneyEarned));
            } catch (error) {
                console.error('Error loading players from localStorage:', error);
                setPlayers(initialPlayers);
                setSortedPlayers([...initialPlayers].sort((a, b) => b.moneyEarned - a.moneyEarned));
            }
        } else {
            // Save initial players to localStorage if none exist
            if (initialPlayers.length > 0) {
                localStorage.setItem('millionaire-players', JSON.stringify(initialPlayers));
            }
            setSortedPlayers([...initialPlayers].sort((a, b) => b.moneyEarned - a.moneyEarned));
        }
    }, [initialPlayers]);

    const handleUpdatePlayer = (playerId: string, newMoneyEarned: number) => {
        setPlayers(prevPlayers => {
            const updatedPlayers = prevPlayers.map(player =>
                player.id === playerId
                    ? { ...player, moneyEarned: newMoneyEarned }
                    : player
            );
            // Update localStorage
            localStorage.setItem('millionaire-players', JSON.stringify(updatedPlayers));
            // Also update sortedPlayers to keep them in sync (but not sorted)
            setSortedPlayers(prevSorted =>
                prevSorted.map(player =>
                    player.id === playerId
                        ? { ...player, moneyEarned: newMoneyEarned }
                        : player
                )
            );
            return updatedPlayers;
        });
    };

    const handleResort = () => {
        setSortedPlayers(prevSorted => {
            const sorted = [...prevSorted].sort((a, b) => b.moneyEarned - a.moneyEarned);
            return sorted;
        });
    };

    const handleSelectPlayer = (playerId: string) => {
        setSelectedPlayerIds(prev => {
            if (prev.includes(playerId)) {
                return prev.filter(id => id !== playerId);
            } else if (prev.length < 2) {
                return [...prev, playerId];
            } else {
                return prev;
            }
        });
    };

    const handleMakeTeam = () => {
        if (selectedPlayerIds.length !== 2) return;
        const [id1, id2] = selectedPlayerIds;
        const player1 = players.find(p => p.id === id1);
        const player2 = players.find(p => p.id === id2);
        if (!player1 || !player2) return;
        // Prevent duplicate teams (regardless of order)
        const teamExists = players.some(p =>
            p.type === 'team' &&
            ((p.names[0] === player1.names[0] && p.names[1] === player2.names[0]) ||
                (p.names[0] === player2.names[0] && p.names[1] === player1.names[0]))
        );
        if (teamExists) {
            alert('A team with these players already exists.');
            return;
        }
        const newTeam: Player = {
            id: `team-${player1.id}-${player2.id}`,
            type: 'team',
            names: [player1.names[0], player2.names[0]],
            moneyEarned: player1.moneyEarned + player2.moneyEarned,
            teamAvatarUrl: player1.avatarUrl || player2.avatarUrl || undefined,
        };
        // Remove player1 and player2 from the list
        const updatedPlayers = [...players.filter(p => p.id !== id1 && p.id !== id2), newTeam];
        setPlayers(updatedPlayers);
        setSortedPlayers([...updatedPlayers].sort((a, b) => b.moneyEarned - a.moneyEarned));
        localStorage.setItem('millionaire-players', JSON.stringify(updatedPlayers));
        setSelectedPlayerIds([]);
    };

    const handleBreakTeam = () => {
        if (selectedPlayerIds.length !== 1) return;
        const teamPlayer = players.find(p => p.id === selectedPlayerIds[0]);
        if (!teamPlayer || teamPlayer.type !== 'team') return;
        const [name1, name2] = teamPlayer.names;
        const splitMoney = teamPlayer.moneyEarned / 2;
        const player1: Player = {
            id: `${teamPlayer.id}-1-${Date.now()}`,
            type: 'single',
            names: [name1],
            moneyEarned: splitMoney,
            avatarUrl: teamPlayer.teamAvatarUrl,
        };
        const player2: Player = {
            id: `${teamPlayer.id}-2-${Date.now()}`,
            type: 'single',
            names: [name2],
            moneyEarned: splitMoney,
            avatarUrl: teamPlayer.teamAvatarUrl,
        };
        // Remove the team and add the two new players
        const updatedPlayers = [...players.filter(p => p.id !== teamPlayer.id), player1, player2];
        setPlayers(updatedPlayers);
        setSortedPlayers([...updatedPlayers].sort((a, b) => b.moneyEarned - a.moneyEarned));
        localStorage.setItem('millionaire-players', JSON.stringify(updatedPlayers));
        setSelectedPlayerIds([]);
    };

    // Add rank to each player in sortedPlayers
    const playersWithRank = sortedPlayers.map((player, index) => ({
        ...player,
        rank: index + 1
    }));

    return (
        <div className="w-full mx-auto p-6">
            <div className="flex justify-end mb-4 w-full max-w-3xl mx-auto gap-2">
                <button
                    onClick={handleResort}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-colors duration-200"
                >
                    Re-sort
                </button>
                <button
                    onClick={handleMakeTeam}
                    disabled={selectedPlayerIds.length !== 2}
                    className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow transition-colors duration-200 ${selectedPlayerIds.length !== 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Make Team
                </button>
                <button
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded shadow transition-colors duration-200"
                    onClick={handleBreakTeam}
                    disabled={selectedPlayerIds.length !== 1 || (selectedPlayerIds.length === 1 && players.find(p => p.id === selectedPlayerIds[0])?.type !== 'team')}
                >
                    Break Team
                </button>
            </div>
            <div className="flex flex-col items-center gap-6">
                {playersWithRank.map((player) => (
                    <PlayerCard
                        key={player.id}
                        playerId={player.id}
                        type={player.type}
                        names={player.names}
                        moneyEarned={player.moneyEarned}
                        rank={player.rank}
                        avatarUrl={player.avatarUrl}
                        teamAvatarUrl={player.teamAvatarUrl}
                        onUpdatePlayer={handleUpdatePlayer}
                        selected={selectedPlayerIds.includes(player.id)}
                        onSelect={handleSelectPlayer}
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
};

export { Leaderboard }; 
