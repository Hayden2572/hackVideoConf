import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../../../services/roomService';

export default function JoinRoomModal({ onClose }) {
    const [roomCode, setRoomCode] = useState('');
    const navigate = useNavigate();

    const joinRoom = async () => {
        if (!roomCode.trim()) return;

        try {
            const isValid = await roomService.validateRoom(roomCode.trim());

            if (!isValid) {
                alert('Комната не найдена. Проверьте код комнаты.');
                return;
            }

            navigate(`/room/${roomCode.trim()}`);

        } catch (error) {
            console.error('Error joining room:', error);
            navigate(`/room/${roomCode.trim()}`);
        } finally {
            onClose();
            setRoomCode('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Присоединиться к встрече</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Код или ID комнаты
                        </label>
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            placeholder="Введите код комнаты..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={joinRoom}
                            disabled={!roomCode.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                        >
                            Присоединиться
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}