import React from 'react';
import { useParams } from 'react-router-dom';
import RoomHeader from '../components/VideoRoom/RoomHeader';
import VideoGrid from '../components/VideoRoom/VideoGrid/VideoGrid';
import ControlsPanel from '../components/VideoRoom/ControlsPanel';
import ChatSidebar from '../components/VideoRoom/ChatSidebar/ChatSidebar';
import { useRoomSocket } from '../components/VideoRoom/hooks/useRoomSocket';
import { useMediaStream } from '../components/VideoRoom/hooks/useMediaStream';

export default function VideoRoomPage() {
    const { roomId } = useParams();

    const {
        localStream,
        isVideoOn,
        isAudioOn,
        toggleVideo,
        toggleAudio,
        mediaError,
        reinitializeMedia
    } = useMediaStream();

    const {
        isConnected,
        remoteStreams,
        chatMessages,
        sendMessage,
        participants,
        connectionError,
        reconnect
    } = useRoomSocket(roomId, localStream);

    return (
        <div className="flex h-screen bg-gradient-to-br from-primary-50 to-gray-100 text-gray-900 font-sans">
            {/* Основная область */}
            <div className="flex-1 flex flex-col">
                <RoomHeader
                    roomId={roomId}
                    isConnected={isConnected}
                    participantsCount={participants.length}
                    connectionError={connectionError}
                    onReconnect={reconnect}
                />

                {/* Показать ошибки */}
                {(mediaError || connectionError) && (
                    <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-red-700">
                                <span>⚠️</span>
                                <span>{mediaError || connectionError}</span>
                            </div>
                            {mediaError && (
                                <button
                                    onClick={reinitializeMedia}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                >
                                    Повторить
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <VideoGrid
                    localStream={localStream}
                    remoteStreams={remoteStreams}
                    isVideoOn={isVideoOn}
                />

                <ControlsPanel
                    isVideoOn={isVideoOn}
                    isAudioOn={isAudioOn}
                    onToggleVideo={toggleVideo}
                    onToggleAudio={toggleAudio}
                    participantsCount={participants.length}
                />
            </div>

            {/* Чат */}
            <ChatSidebar
                messages={chatMessages}
                onSendMessage={sendMessage}
            />
        </div>
    );
}