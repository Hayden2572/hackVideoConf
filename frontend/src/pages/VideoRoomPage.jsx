import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import { useWebSocket } from '../hooks/useWebSocket';

export default function VideoRoomPage() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const localVideoRef = useRef();
    const remoteVideosRef = useRef({});

    const {
        createOffer,
        createAnswer,
        addIceCandidate
    } = useWebRTC();

    const {
        sendMessage,
        isConnected
    } = useWebSocket(roomId, 'user-' + Date.now());

    useEffect(() => {
        async function initMedia() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                setLocalStream(stream);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing media devices:', error);
            }
        }

        initMedia();
    }, []);

    useEffect(() => {
        if (!window.ws) return;

        function handleMessage(event) {
            const data = JSON.parse(event.data);

            switch(data.type) {
                case 'webrtc_offer':
                    handleOffer(data);
                    break;
                case 'webrtc_answer':
                    handleAnswer(data);
                    break;
                case 'ice_candidate':
                    handleIceCandidate(data);
                    break;
                case 'chat_message':
                    setChatMessages(prev => [...prev, {
                        from: data.from,
                        text: data.data.text,
                        timestamp: data.data.timestamp
                    }]);
                    break;
                case 'user_joined':
                    console.log('User joined:', data.from);
                    createOffer(data.from);
                    break;
                case 'user_left':
                    console.log('User left:', data.from);
                    setRemoteStreams(prev => {
                        const newStreams = { ...prev };
                        delete newStreams[data.from];
                        return newStreams;
                    });
                    break;
            }
        }

        window.ws.addEventListener('message', handleMessage);
        return () => window.ws?.removeEventListener('message', handleMessage);
    }, [createOffer]);

    async function handleOffer(data) {
        const answer = await createAnswer(data.from, data.data.sdp);
        sendMessage({
            type: 'webrtc_answer',
            to: data.from,
            data: { sdp: answer }
        });
    }

    async function handleAnswer(data) {
        // Implementation for handling answer
    }

    async function handleIceCandidate(data) {
        await addIceCandidate(data.from, data.data.candidate);
    }

    function toggleVideo() {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOn(videoTrack.enabled);
        }
    }

    function toggleAudio() {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioOn(audioTrack.enabled);
        }
    }

    function sendChatMessage() {
        if (newMessage.trim()) {
            sendMessage({
                type: 'chat_message',
                to: 'all',
                data: {
                    text: newMessage,
                    timestamp: new Date().toISOString()
                }
            });
            setNewMessage('');
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    }

    function copyRoomLink() {
        const roomLink = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(roomLink);
        alert('Ссылка на комнату скопирована!');
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-primary-50 to-gray-100 text-gray-900 font-sans">
            {/* Основная область с видео */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Комната: {roomId}</h1>
                        <div className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                            {isConnected ? '✅ Подключено' : '❌ Отключено'}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={copyRoomLink}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            📋 Копировать ссылку
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            ← Назад
                        </button>
                    </div>
                </div>

                {/* Видео контейнер */}
                <div className="flex-1 flex flex-wrap gap-6 p-6 justify-center items-center overflow-auto">
                    {/* Локальное видео */}
                    <div className="relative bg-white rounded-2xl overflow-hidden w-80 h-80 flex-shrink-0 border-2 border-primary-500 shadow-lg">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-3 left-3 bg-primary-500 text-white px-3 py-1 text-sm rounded-lg font-medium">
                            Вы {!isVideoOn && '📹❌'} {!isAudioOn && '🎤❌'}
                        </div>
                        {!isVideoOn && (
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-2xl">
                                <div className="text-center text-gray-600">
                                    <div className="text-4xl mb-2">👤</div>
                                    <div className="text-sm font-medium">Камера выключена</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Удаленные видео */}
                    {Object.entries(remoteStreams).map(([userId, stream]) => (
                        <div key={userId} className="relative bg-white rounded-2xl overflow-hidden w-80 h-80 flex-shrink-0 border-2 border-secondary-500 shadow-lg">
                            <video
                                ref={el => {
                                    remoteVideosRef.current[userId] = el;
                                    if (el && stream) {
                                        el.srcObject = stream;
                                    }
                                }}
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-3 left-3 bg-secondary-500 text-white px-3 py-1 text-sm rounded-lg font-medium">
                                {userId}
                            </div>
                        </div>
                    ))}

                    {/* Заглушка если нет удаленных участников */}
                    {Object.keys(remoteStreams).length === 0 && (
                        <div className="flex flex-col items-center justify-center text-gray-500 bg-white rounded-2xl p-8 shadow-lg">
                            <div className="text-6xl mb-4 text-primary-500">👥</div>
                            <div className="text-lg font-medium text-gray-700">Ожидаем участников...</div>
                            <div className="text-sm mt-2 text-gray-500">Поделитесь ссылкой на комнату</div>
                        </div>
                    )}
                </div>

                {/* Панель управления */}
                <div className="p-4 border-t border-gray-200 bg-white shadow-sm">
                    <div className="flex justify-center items-center space-x-4">
                        <button
                            onClick={toggleVideo}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all shadow-sm ${
                                isVideoOn
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                        >
                            <span className="text-xl">{isVideoOn ? '📹' : '📷'}</span>
                            <span>{isVideoOn ? 'Выкл камеру' : 'Вкл камеру'}</span>
                        </button>

                        <button
                            onClick={toggleAudio}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all shadow-sm ${
                                isAudioOn
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                        >
                            <span className="text-xl">{isAudioOn ? '🎤' : '🎙️'}</span>
                            <span>{isAudioOn ? 'Выкл микрофон' : 'Вкл микрофон'}</span>
                        </button>

                        <div className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-3 rounded-lg font-medium shadow-sm">
                            <span className="text-lg">👥</span>
                            <span>Участники: {Object.keys(remoteStreams).length + 1}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Боковая панель чата */}
            <div className="w-80 flex flex-col border-l border-gray-200 bg-white shadow-lg">
                <div className="p-4 border-b border-gray-200 bg-primary-500">
                    <h2 className="text-lg font-semibold text-white">Чат комнаты</h2>
                </div>

                {/* Сообщения чата */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
                    {chatMessages.map((message, index) => (
                        <div key={index} className={`p-3 rounded-xl ${
                            message.from.startsWith('user-')
                                ? 'bg-primary-100 border border-primary-200'
                                : 'bg-white border border-gray-200'
                        } shadow-sm`}>
                            <div className="flex justify-between items-start mb-1">
                                <div className="font-medium text-sm text-primary-600">
                                    {message.from}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                            <div className="text-sm text-gray-700">{message.text}</div>
                        </div>
                    ))}

                    {chatMessages.length === 0 && (
                        <div className="text-center text-gray-500 py-8 bg-white rounded-lg border border-gray-200">
                            <div className="text-4xl mb-2 text-primary-400">💬</div>
                            <div className="font-medium text-gray-600">Нет сообщений</div>
                            <div className="text-sm text-gray-500">Начните общение!</div>
                        </div>
                    )}
                </div>

                {/* Ввод сообщения */}
                <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Введите сообщение..."
                            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                        />
                        <button
                            onClick={sendChatMessage}
                            disabled={!newMessage.trim()}
                            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            📨
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}