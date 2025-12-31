import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, User, Plus, Minus } from 'lucide-react';

interface PlayerCardProps {
    type: 'single' | 'team';
    names: string[];
    moneyEarned: number;
    rank?: number;
    avatarUrl?: string;
    teamAvatarUrl?: string;
    playerId: string;
    onUpdatePlayer?: (playerId: string, newMoneyEarned: number) => void;
    selected?: boolean;
    onSelect?: (playerId: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
    type,
    names,
    moneyEarned,
    rank,
    avatarUrl,
    teamAvatarUrl,
    playerId,
    onUpdatePlayer,
    selected = false,
    onSelect
}) => {
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }).format(Math.round(amount * 10) / 10);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(moneyEarned.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    // Keep editValue in sync if moneyEarned changes from above
    React.useEffect(() => {
        if (!isEditing) setEditValue(moneyEarned.toString());
    }, [moneyEarned, isEditing]);

    const handleIncreaseMoney = () => {
        if (onUpdatePlayer) {
            onUpdatePlayer(playerId, moneyEarned + 10);
        }
    };

    const handleDecreaseMoney = () => {
        if (onUpdatePlayer && moneyEarned >= 10) {
            onUpdatePlayer(playerId, moneyEarned - 10);
        }
    };

    const handleMoneyClick = () => {
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow numbers and a single decimal point
        const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        setEditValue(val);
    };

    const finishEdit = (commit: boolean) => {
        if (commit && onUpdatePlayer) {
            const newValue = parseFloat(editValue);
            if (!isNaN(newValue) && newValue >= 0 && newValue !== moneyEarned) {
                onUpdatePlayer(playerId, Math.round(newValue * 10) / 10);
            }
        }
        setIsEditing(false);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            finishEdit(true);
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue(moneyEarned.toString());
        }
    };

    return (
        <Card
            className={`w-full max-w-3xl hover:shadow-lg transition-shadow duration-200 bg-gray-800 border-gray-700 hover:border-gray-600 ${selected ? 'ring-4 ring-blue-400 border-blue-400' : ''}`}
            onClick={onSelect ? () => onSelect(playerId) : undefined}
            style={{ cursor: onSelect ? 'pointer' : undefined }}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    {/* Left side - Player info */}
                    <div className="flex items-center space-x-3">
                        {/* Rank badge */}
                        {rank && (
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                                {rank}
                            </div>
                        )}
                        {/* Selection indicator */}
                        {onSelect && (
                            <div className="flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={selected}
                                    readOnly
                                    className="accent-blue-500 w-5 h-5 mr-2"
                                    tabIndex={-1}
                                    style={{ pointerEvents: 'none' }}
                                />
                            </div>
                        )}

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

                    {/* Right side - Money earned and controls */}
                    <div className="flex-shrink-0 text-right">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            {/* Decrease button */}
                            <button
                                onClick={handleDecreaseMoney}
                                disabled={!onUpdatePlayer || moneyEarned < 10}
                                className="p-1 rounded-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                                title="Decrease by $10"
                            >
                                <Minus className="w-4 h-4 text-white" />
                            </button>

                            {/* Money display or input */}
                            {isEditing ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={editValue}
                                    onChange={handleInputChange}
                                    onBlur={() => finishEdit(true)}
                                    onKeyDown={handleInputKeyDown}
                                    className="text-lg font-bold text-green-400 min-w-[80px] text-center bg-gray-900 border border-green-400 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-green-500"
                                    style={{ width: '80px' }}
                                />
                            ) : (
                                <p
                                    className="text-lg font-bold text-green-400 min-w-[80px] text-center cursor-pointer hover:underline"
                                    title="Click to edit"
                                    onClick={onUpdatePlayer ? handleMoneyClick : undefined}
                                    tabIndex={onUpdatePlayer ? 0 : -1}
                                    onKeyDown={e => {
                                        if (onUpdatePlayer && (e.key === 'Enter' || e.key === ' ')) handleMoneyClick();
                                    }}
                                    role={onUpdatePlayer ? 'button' : undefined}
                                >
                                    {formatMoney(moneyEarned)}
                                </p>
                            )}

                            {/* Increase button */}
                            <button
                                onClick={handleIncreaseMoney}
                                disabled={!onUpdatePlayer}
                                className="p-1 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                                title="Increase by $10"
                            >
                                <Plus className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PlayerCard; 
