import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../../../services/roomService';

export default function CreateRoomModal({ onClose }) {
    const [roomName, setRoomName] = useState('');
    const [creatingRoom, setCreatingRoom] = useState(false);
    const navigate = useNavigate();

    const createRoom = async () => {
        if (!roomName.trim()) return;

        setCreatingRoom(true);
        try {
            const roomData = {
                roomName: roomName.trim(),
                description: `Комната для встречи: ${roomName}`,
                maxParticipants: 10
            };

            const createdRoom = await roomService.createRoom(roomData);
            navigate(`/room/${createdRoom.roomId}`);

        } catch (error) {
            console.error('Error creating room:', error);
            const localRoomId = roomName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
            navigate(`/room/${localRoomId}`);
        } finally {
            setCreatingRoom(false);
            onClose();
            setRoomName('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Создать новую встречу</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Название встречи
                        </label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Например: Командная планерка"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={createRoom}
                            disabled={!roomName.trim() || creatingRoom}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center font-medium"
                        >
                            {creatingRoom ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Создание...
                                </>
                            ) : (
                                'Создать встречу'
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={creatingRoom}
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