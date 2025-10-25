import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickAccessPanel() {
    const navigate = useNavigate();

    const quickJoin = (roomId, roomName) => {
        navigate(`/room/${roomId}`);
    };

    return (
        <div className="space-y-6">
            {/* Быстрый старт */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Быстрый старт</h3>
                <div className="space-y-3">
                    <button
                        onClick={() => quickJoin('demo-room-1', 'Демо комната 1')}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                        <div className="font-medium text-gray-900">🚀 Демо комната 1</div>
                        <div className="text-sm text-gray-600">Тестирование функционала</div>
                    </button>

                    <button
                        onClick={() => quickJoin('demo-room-2', 'Демо комната 2')}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                        <div className="font-medium text-gray-900">🎯 Демо комната 2</div>
                        <div className="text-sm text-gray-600">Резервная комната</div>
                    </button>

                    <button
                        onClick={() => quickJoin('team-meeting', 'Командная встреча')}
                        className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                    >
                        <div className="font-medium text-gray-900">👥 Командная встреча</div>
                        <div className="text-sm text-gray-600">Для рабочих обсуждений</div>
                    </button>
                </div>
            </div>

            {/* Инструкция */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-900">📋 Как начать:</h3>
                <ol className="space-y-2 text-blue-800">
                    <li className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold">1</span>
                        <span>Создайте встречу или присоединитесь по коду</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold">2</span>
                        <span>Разрешите доступ к камере и микрофону</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold">3</span>
                        <span>Пригласите участников по ссылке</span>
                    </li>
                    <li className="flex items-start space-x-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold">4</span>
                        <span>Наслаждайтесь видеозвонком!</span>
                    </li>
                </ol>
            </div>
        </div>
    );
}