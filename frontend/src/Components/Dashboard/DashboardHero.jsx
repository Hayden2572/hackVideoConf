import React from 'react';

export default function DashboardHero({ onCreateRoom, onJoinRoom }) {
    return (
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Видеоконференции
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Простая и надежная платформа для видеовстреч с поддержкой WebRTC
            </p>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={onCreateRoom}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center space-x-3 shadow-lg"
                >
                    <span className="text-xl">🎥</span>
                    <span>Новая встреча</span>
                </button>
                <button
                    onClick={onJoinRoom}
                    className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-center space-x-3"
                >
                    <span className="text-xl">🔗</span>
                    <span>Присоединиться</span>
                </button>
            </div>
        </div>
    );
}