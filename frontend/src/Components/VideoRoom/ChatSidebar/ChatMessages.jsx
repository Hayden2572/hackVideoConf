import React, { useMemo } from 'react';

export default React.memo(function ChatMessages({ messages }) {
    const formattedMessages = useMemo(() =>
            messages.map(message => ({
                ...message,
                displayTime: new Date(message.timestamp).toLocaleTimeString()
            })),
        [messages]);

    return (
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {formattedMessages.map((message, index) => (
                <div
                    key={`${message.timestamp}-${index}`}
                    className={`p-3 rounded-xl ${
                        message.from.startsWith('user-')
                            ? 'bg-primary-100 border border-primary-200'
                            : 'bg-white border border-gray-200'
                    } shadow-sm`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-sm text-primary-600">
                            {message.from}
                        </div>
                        <div className="text-xs text-gray-500">
                            {message.displayTime}
                        </div>
                    </div>
                    <div className="text-sm text-gray-700">{message.text}</div>
                </div>
            ))}

            {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8 bg-white rounded-lg border border-gray-200">
                    <div className="text-4xl mb-2 text-primary-400">💬</div>
                    <div className="font-medium text-gray-600">Нет сообщений</div>
                    <div className="text-sm text-gray-500">Начните общение!</div>
                </div>
            )}
        </div>
    );
});