import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, User } from 'lucide-react';

interface GamePlayerCardProps {
    type: 'single' | 'team';
    names: string[];
    playerInput: string;
    avatarUrl?: string;
    teamAvatarUrl?: string;
    playerId: string;
    onUpdateInput?: (playerId: string, newInput: string) => void;
    readOnly?: boolean;
    maskValue?: boolean;
    isWinner?: boolean;
}

const GamePlayerCard: React.FC<GamePlayerCardProps> = ({
    type,
    names,
    playerInput,
    avatarUrl,
    teamAvatarUrl,
    playerId,
    onUpdateInput,
    readOnly = false,
    maskValue = false,
    isWinner = false
}) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onUpdateInput) {
            onUpdateInput(playerId, e.target.value);
        }
    };

    return (
        <Card className={`w-full max-w-3xl hover:shadow-lg transition-shadow duration-200 bg-gray-800 border-gray-700 hover:border-gray-600 ${isWinner ? 'border-green-500 border-2' : ''}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    {/* Left side - Player info */}
                    <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {type === 'single' ? (
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={avatarUrl} alt={names[0]} />
                                    <AvatarFallback className="bg-blue-900 text-blue-300">
                                        {getInitials(names[0])}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <div className="relative">
                                    <Avatar className="w-12 h-12 border-2 border-gray-700">
                                        <AvatarImage src={teamAvatarUrl} alt={names.join(' & ')} />
                                        <AvatarFallback className="bg-green-900 text-green-300">
                                            <Users className="w-6 h-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            )}
                        </div>

                        {/* Names */}
                        <div className="flex-1 min-w-0">
                            {type === 'single' ? (
                                <div>
                                    <p className="font-semibold text-gray-100 truncate">{names[0]}</p>
                                    <p className="text-sm text-gray-400 flex items-center">
                                        <User className="w-3 h-3 mr-1" />
                                        Single Player
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {names.map((name, index) => (
                                        <p key={index} className="font-semibold text-gray-100 truncate">{name}</p>
                                    ))}
                                    <p className="text-sm text-gray-400 flex items-center">
                                        <Users className="w-3 h-3 mr-1" />
                                        Team ({names.length} {names.length === 1 ? 'player' : 'players'})
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side - Text input */}
                    <div className="flex-shrink-0">
                        <input
                            type="text"
                            value={
                                maskValue && playerInput && playerInput.trim() !== ''
                                    ? '*****'
                                    : playerInput || ''
                            }
                            onChange={handleInputChange}
                            readOnly={readOnly}
                            disabled={readOnly}
                            className={`text-lg font-medium text-gray-100 min-w-[200px] text-center bg-gray-900 border border-gray-600 rounded px-3 py-2 outline-none transition-colors ${readOnly
                                ? 'cursor-not-allowed opacity-60'
                                : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-500'
                                }`}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GamePlayerCard;

