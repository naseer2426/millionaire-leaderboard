import { useState, useEffect } from 'react';
import GamePlayerCard from './GamePlayerCard';
import type { Player } from './Leaderboard';

interface AdminSettings {
    secret: boolean;
    winningPlayer?: string;
    selectedImage?: string;
}

function Admin() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [secret, setSecret] = useState<boolean>(true);
    const [winningPlayer, setWinningPlayer] = useState<string | undefined>(undefined);
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
    const [availableImages, setAvailableImages] = useState<string[]>([]);

    // Load available images from game_images.json
    useEffect(() => {
        fetch('/game_images.json')
            .then(res => res.json())
            .then((data: string[]) => {
                setAvailableImages(data);
            })
            .catch(error => {
                console.error('Error loading game images:', error);
                setAvailableImages([]);
            });
    }, []);

    // Load admin settings from localStorage
    useEffect(() => {
        const adminSettings = localStorage.getItem('admin-settings');
        if (adminSettings) {
            try {
                const parsed: AdminSettings = JSON.parse(adminSettings);
                setSecret(parsed.secret !== undefined ? parsed.secret : true);
                setWinningPlayer(parsed.winningPlayer);
                setSelectedImage(parsed.selectedImage);
            } catch (error) {
                console.error('Error loading admin settings:', error);
                // If parsing fails, default to true and save it
                setSecret(true);
                const defaultSettings: AdminSettings = { secret: true };
                localStorage.setItem('admin-settings', JSON.stringify(defaultSettings));
            }
        } else {
            // If settings are missing, default to true and save it
            setSecret(true);
            const defaultSettings: AdminSettings = { secret: true };
            localStorage.setItem('admin-settings', JSON.stringify(defaultSettings));
        }
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

    const handleToggleSecret = () => {
        const newSecret = !secret;
        setSecret(newSecret);
        const adminSettings: AdminSettings = { secret: newSecret, winningPlayer, selectedImage };
        localStorage.setItem('admin-settings', JSON.stringify(adminSettings));
        // Dispatch custom event for same-window updates
        window.dispatchEvent(new Event('admin-settings-changed'));
    };

    const handleImageChange = (imagePath: string) => {
        const newSelectedImage = imagePath === '' ? undefined : imagePath;
        setSelectedImage(newSelectedImage);
        const adminSettings: AdminSettings = { secret, winningPlayer, selectedImage: newSelectedImage };
        localStorage.setItem('admin-settings', JSON.stringify(adminSettings));
        // Dispatch custom event for same-window updates
        window.dispatchEvent(new Event('admin-settings-changed'));
    };

    const evaluateTokenGame = (players: Player[]): string | undefined => {
        // Parse all player inputs as integers and filter out invalid entries
        const validPlayers: Array<{ playerId: string; weight: number }> = [];

        for (const player of players) {
            const input = player.playerInput?.trim();
            if (!input) continue;

            const weight = parseInt(input, 10);
            // Only include players with positive weights
            if (!isNaN(weight) && weight > 0) {
                validPlayers.push({ playerId: player.id, weight });
            }
        }

        if (validPlayers.length === 0) {
            return undefined;
        }

        // Calculate total weight
        const totalWeight = validPlayers.reduce((sum, { weight }) => sum + weight, 0);

        if (totalWeight === 0) {
            return undefined;
        }

        // Generate random number between 0 and totalWeight
        const random = Math.random() * totalWeight;

        // Find the winner using weighted random selection
        let accumulatedWeight = 0;
        for (const { playerId, weight } of validPlayers) {
            accumulatedWeight += weight;
            if (random <= accumulatedWeight) {
                return playerId;
            }
        }

        // Fallback (shouldn't reach here, but just in case)
        return undefined;
    };

    const evaluateUniqueBidGame = (players: Player[]): string | undefined => {
        // Parse all player inputs as integers and filter out invalid entries
        const validBids: Array<{ playerId: string; bid: number }> = [];

        for (const player of players) {
            const input = player.playerInput?.trim();
            if (!input) continue;

            const bid = parseInt(input, 10);
            if (!isNaN(bid)) {
                validBids.push({ playerId: player.id, bid });
            }
        }

        if (validBids.length === 0) {
            return undefined;
        }

        // Count occurrences of each bid
        const bidCounts = new Map<number, number>();
        for (const { bid } of validBids) {
            bidCounts.set(bid, (bidCounts.get(bid) || 0) + 1);
        }

        // Find unique bids (appear exactly once)
        const uniqueBids = validBids.filter(({ bid }) => bidCounts.get(bid) === 1);

        if (uniqueBids.length === 0) {
            return undefined;
        }

        // Find the lowest unique bid
        const lowestUniqueBid = Math.min(...uniqueBids.map(({ bid }) => bid));
        const winner = uniqueBids.find(({ bid }) => bid === lowestUniqueBid);

        return winner?.playerId;
    };

    const handleTokenGame = () => {
        const winnerId = evaluateTokenGame(players);
        if (winnerId) {
            setWinningPlayer(winnerId);
            const adminSettings: AdminSettings = { secret, winningPlayer: winnerId, selectedImage };
            localStorage.setItem('admin-settings', JSON.stringify(adminSettings));
            // Dispatch custom event for same-window updates
            window.dispatchEvent(new Event('admin-settings-changed'));
        }
    };

    const handleUniqueBidGame = () => {
        const winnerId = evaluateUniqueBidGame(players);
        if (winnerId) {
            setWinningPlayer(winnerId);
            const adminSettings: AdminSettings = { secret, winningPlayer: winnerId, selectedImage };
            localStorage.setItem('admin-settings', JSON.stringify(adminSettings));
            // Dispatch custom event for same-window updates
            window.dispatchEvent(new Event('admin-settings-changed'));
        }
    };

    return (
        <div className="w-full mx-auto p-6">
            {/* Secret Toggle */}
            <div className="flex justify-center mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-gray-300 font-medium">Secret</span>
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={secret}
                            onChange={handleToggleSecret}
                            className="sr-only"
                        />
                        <div
                            className={`w-14 h-8 rounded-full transition-colors duration-200 ${secret ? 'bg-red-600' : 'bg-gray-600'
                                }`}
                        >
                            <div
                                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${secret ? 'transform translate-x-6' : ''
                                    }`}
                            />
                        </div>
                    </div>
                </label>
            </div>

            {/* Game Buttons */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={handleTokenGame}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition-colors duration-200 font-medium"
                >
                    Token Game
                </button>
                <button
                    onClick={handleUniqueBidGame}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded shadow transition-colors duration-200 font-medium"
                >
                    Unique Bid Game
                </button>
            </div>

            {/* Image Selection Dropdown */}
            <div className="flex justify-center mb-6">
                <div className="w-full max-w-md">
                    <label className="block text-gray-300 font-medium mb-2 text-center">
                        Select Game Image
                    </label>
                    <select
                        value={selectedImage || ''}
                        onChange={(e) => handleImageChange(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">None</option>
                        {availableImages.map((image) => (
                            <option key={image} value={`/game_images/${image}`}>
                                {image}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

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
                        readOnly={false}
                        isWinner={winningPlayer === player.id}
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

export { Admin };

