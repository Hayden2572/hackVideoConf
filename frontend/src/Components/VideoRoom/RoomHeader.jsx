import React from 'react';

export default function RoomHeader({
                                       roomId,
                                       roomName,
                                       isConnected,
                                       participantsCount,
                                       connectionError,
                                       onReconnect
                                   }) {
    return (
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            {roomName || `Комната: ${roomId}`}
                        </h1>
                        <p className="text-sm text-gray-500">ID: {roomId}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                        isConnected
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${
                            isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span>{isConnected ? 'Подключено' : 'Не подключено'}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>👥</span>
                        <span>{participantsCount} участников</span>
                    </div>

                    {connectionError && (
                        <button
                            onClick={onReconnect}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                            Переподключиться
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}