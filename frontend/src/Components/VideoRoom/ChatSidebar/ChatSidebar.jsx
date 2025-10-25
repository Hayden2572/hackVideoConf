import React from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

export default function ChatSidebar({ messages, onSendMessage }) {
    return (
        <div className="w-80 flex flex-col border-l border-gray-200 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200 bg-primary-500">
                <h2 className="text-lg font-semibold text-white">Чат комнаты</h2>
            </div>

            <ChatMessages messages={messages} />
            <ChatInput onSendMessage={onSendMessage} />
        </div>
    );
}