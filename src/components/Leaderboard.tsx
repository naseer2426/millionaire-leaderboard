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
            } else {
                return [...prev, playerId];
            }
        });
    };

    const handleMakeTeam = () => {
        if (selectedPlayerIds.length < 2) return;

        const selectedPlayers = selectedPlayerIds
            .map(id => players.find(p => p.id === id))
            .filter((p): p is Player => p !== undefined);

        if (selectedPlayers.length !== selectedPlayerIds.length) return;

        // Prevent merging if any selected player is already a team with more than 1 player
        const hasExistingTeam = selectedPlayers.some(p => p.type === 'team' && p.names.length > 1);
        if (hasExistingTeam) {
            alert('Cannot merge teams. Please break existing teams first before creating a new team.');
            return;
        }

        // Get all names from selected players
        const teamNames = selectedPlayers.map(p => p.names[0]);

        // Prevent duplicate teams (regardless of order)
        // Check if a team exists with the same set of names
        const teamExists = players.some(p => {
            if (p.type !== 'team' || p.names.length !== teamNames.length) return false;
            // Check if all names match (order-independent)
            const sortedExistingNames = [...p.names].sort();
            const sortedNewNames = [...teamNames].sort();
            return sortedExistingNames.every((name, idx) => name === sortedNewNames[idx]);
        });

        if (teamExists) {
            alert('A team with these players already exists.');
            return;
        }

        // Calculate total money earned
        const totalMoney = selectedPlayers.reduce((sum, p) => sum + p.moneyEarned, 0);

        // Get first available avatar
        const teamAvatarUrl = selectedPlayers.find(p => p.avatarUrl)?.avatarUrl || undefined;

        const newTeam: Player = {
            id: `team-${selectedPlayerIds.join('-')}`,
            type: 'team',
            names: teamNames,
            moneyEarned: totalMoney,
            teamAvatarUrl: teamAvatarUrl,
        };

        // Remove all selected players from the list
        const updatedPlayers = [...players.filter(p => !selectedPlayerIds.includes(p.id)), newTeam];
        setPlayers(updatedPlayers);
        setSortedPlayers([...updatedPlayers].sort((a, b) => b.moneyEarned - a.moneyEarned));
        localStorage.setItem('millionaire-players', JSON.stringify(updatedPlayers));
        setSelectedPlayerIds([]);
    };

    const handleBreakTeam = () => {
        if (selectedPlayerIds.length !== 1) return;
        const teamPlayer = players.find(p => p.id === selectedPlayerIds[0]);
        if (!teamPlayer || teamPlayer.type !== 'team') return;

        // Split money equally among all team members
        const splitMoney = teamPlayer.moneyEarned / teamPlayer.names.length;

        // Create individual players from team members
        const individualPlayers: Player[] = teamPlayer.names.map((name, index) => ({
            id: `${teamPlayer.id}-${index + 1}-${Date.now()}`,
            type: 'single',
            names: [name],
            moneyEarned: splitMoney,
            avatarUrl: teamPlayer.teamAvatarUrl,
        }));

        // Remove the team and add all individual players
        const updatedPlayers = [...players.filter(p => p.id !== teamPlayer.id), ...individualPlayers];
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

    // Check if any selected player is already a team (prevents merging teams)
    const hasExistingTeam = selectedPlayerIds.some(id => {
        const player = players.find(p => p.id === id);
        return player?.type === 'team' && player.names.length > 1;
    });
    const canMakeTeam = selectedPlayerIds.length >= 2 && !hasExistingTeam;

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
                    disabled={!canMakeTeam}
                    className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow transition-colors duration-200 ${!canMakeTeam ? 'opacity-50 cursor-not-allowed' : ''}`}
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
