import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoomHeader({
                                       roomId,
                                       isConnected,
                                       participantsCount,
                                       connectionError,
                                       onReconnect
                                   }) {
    const navigate = useNavigate();

    function copyRoomLink() {
        const roomLink = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(roomLink);
        alert('Ссылка на комнату скопирована!');
    }

    return (
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white shadow-sm">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Комната: {roomId}</h1>
                <div className="flex items-center space-x-4">
                    <div className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {isConnected ? '✅ Подключено' : '❌ Отключено'}
                    </div>
                    {connectionError && (
                        <button
                            onClick={onReconnect}
                            className="text-sm bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                        >
                            Переподключиться
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-primary-500 text-white px-3 py-1 rounded-lg text-sm">
                    <span>👥</span>
                    <span>{participantsCount}</span>
                </div>

                <button
                    onClick={copyRoomLink}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    📋 Копировать ссылку
                </button>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    ← Назад
                </button>
            </div>
        </div>
    );
}