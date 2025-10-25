import React from 'react';

export default function ControlsPanel({
                                          isVideoOn,
                                          isAudioOn,
                                          onToggleVideo,
                                          onToggleAudio,
                                          participantsCount
                                      }) {
    return (
        <div className="p-4 border-t border-gray-200 bg-white shadow-sm">
            <div className="flex justify-center items-center space-x-4">
                {/* Кнопка видео */}
                <button
                    onClick={onToggleVideo}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all shadow-sm ${
                        isVideoOn
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                    <span className="text-xl">{isVideoOn ? '📹' : '📷'}</span>
                    <span>{isVideoOn ? 'Выкл камеру' : 'Вкл камеру'}</span>
                </button>

                {/* Кнопка аудио */}
                <button
                    onClick={onToggleAudio}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all shadow-sm ${
                        isAudioOn
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                    <span className="text-xl">{isAudioOn ? '🎤' : '🎙️'}</span>
                    <span>{isAudioOn ? 'Выкл микрофон' : 'Вкл микрофон'}</span>
                </button>

                {/* Счетчик участников */}
                <div className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-3 rounded-lg font-medium shadow-sm">
                    <span className="text-lg">👥</span>
                    <span>Участники: {participantsCount}</span>
                </div>
            </div>
        </div>
    );
}