import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RoomHeader from '../components/VideoRoom/RoomHeader';
import VideoGrid from '../components/VideoRoom/VideoGrid/VideoGrid';
import ControlsPanel from '../components/VideoRoom/ControlsPanel';
import ChatSidebar from '../components/VideoRoom/ChatSidebar/ChatSidebar';
import { useRoomSocket } from '../components/VideoRoom/hooks/useRoomSocket';
import { useMediaStream } from '../components/VideoRoom/hooks/useMediaStream';
import { roomService } from '../services/roomService';

export default function VideoRoomPage() {
    const { roomId } = useParams();
    const [roomInfo, setRoomInfo] = useState(null);
    const [roomLoading, setRoomLoading] = useState(true);

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

    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                const info = await roomService.getRoom(roomId);
                setRoomInfo(info);
            } catch (error) {
                console.error('Error fetching room info:', error);
                setRoomInfo({
                    roomName: `Комната ${roomId}`,
                    participants: []
                });
            } finally {
                setRoomLoading(false);
            }
        };

        fetchRoomInfo();
    }, [roomId]);

    if (roomLoading) {
        return (
            <div className="flex h-screen bg-gray-100 items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка комнаты...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-primary-50 to-gray-100 text-gray-900 font-sans">
            <div className="flex-1 flex flex-col">
                <RoomHeader
                    roomId={roomId}
                    roomName={roomInfo?.roomName}
                    isConnected={isConnected}
                    participantsCount={participants.length}
                    connectionError={connectionError}
                    onReconnect={reconnect}
                />

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

            <ChatSidebar
                messages={chatMessages}
                onSendMessage={sendMessage}
            />
        </div>
    );
}