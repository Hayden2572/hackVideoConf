import React from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../services/roomService';

const recentRooms = [
    { id: 'demo-room-1', name: 'Демо комната 1', lastJoined: new Date().toISOString() },
    { id: 'demo-room-2', name: 'Демо комната 2', lastJoined: new Date(Date.now() - 86400000).toISOString() },
    { id: 'team-meeting', name: 'Командная встреча', lastJoined: new Date(Date.now() - 172800000).toISOString() }
];

export default function RecentRooms() {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Сегодня';
        } else if (diffDays === 1) {
            return 'Вчера';
        } else if (diffDays < 7) {
            return `${diffDays} дней назад`;
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    };

    const quickJoin = (roomId) => {
        navigate(`/room/${roomId}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Недавние комнаты</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {recentRooms.length} комнат
                </span>
            </div>

            {recentRooms.length > 0 ? (
                <div className="space-y-4">
                    {recentRooms.map((room) => (
                        <button
                            key={room.id}
                            onClick={() => quickJoin(room.id)}
                            className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group hover:shadow-md"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                        <span className="text-blue-600 text-lg">🎪</span>
                                    </div>
                                    <div>
                                        <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                            {room.name}
                                        </div>
                                        <div className="text-sm text-gray-500 font-mono">
                                            {room.id}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                    {formatDate(room.lastJoined)}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎪</div>
                    <p className="text-gray-500 mb-2">У вас пока нет недавних комнат</p>
                    <p className="text-sm text-gray-400">Создайте свою первую встречу!</p>
                </div>
            )}
        </div>
    );
}