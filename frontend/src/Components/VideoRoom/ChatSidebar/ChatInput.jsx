import React, { useState } from 'react';

export default function ChatInput({ onSendMessage }) {
    const [message, setMessage] = useState('');

    function handleSubmit() {
        if (message.trim()) {
            onSendMessage({
                type: 'chat_message',
                to: 'all',
                data: {
                    text: message,
                    timestamp: new Date().toISOString()
                }
            });
            setMessage('');
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    return (
        <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!message.trim()}
                    className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    📨
                </button>
            </div>
        </div>
    );
}