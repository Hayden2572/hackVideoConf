import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../../../services/authService';

export function useRoomSocket(roomId, localStream) {
    const [isConnected, setIsConnected] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [chatMessages, setChatMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [connectionError, setConnectionError] = useState(null);

    const peerConnections = useRef({});
    const wsRef = useRef(null);

    const getWebSocketUrl = useCallback(async () => {
        const user = await authService.getProfile();
        const userId = `user-${user.id}-${Date.now()}`;
        return `ws://localhost:3001/ws/${roomId}/${userId}`;
    }, [roomId]);

    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    const createPeerConnection = useCallback((userId) => {
        if (peerConnections.current[userId]) {
            return peerConnections.current[userId];
        }

        const pc = new RTCPeerConnection(rtcConfig);

        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'ice_candidate',
                    to: userId,
                    candidate: event.candidate
                }));
            }
        };

        pc.ontrack = (event) => {
            const remoteStream = event.streams[0];
            setRemoteStreams(prev => ({
                ...prev,
                [userId]: remoteStream
            }));
        };

        peerConnections.current[userId] = pc;
        return pc;
    }, [localStream]);

    const handleWebSocketMessage = useCallback((data) => {
        switch(data.type) {
            case 'webrtc_offer':
                handleOffer(data.from, data.sdp);
                break;
            case 'webrtc_answer':
                handleAnswer(data.from, data.sdp);
                break;
            case 'ice_candidate':
                handleIceCandidate(data.from, data.candidate);
                break;
            case 'chat_message':
                setChatMessages(prev => [...prev, {
                    from: data.from,
                    text: data.text || data.data?.text,
                    timestamp: data.timestamp || new Date().toISOString()
                }]);
                break;
            case 'user_joined':
                setParticipants(prev => {
                    if (!prev.includes(data.from)) {
                        return [...prev, data.from];
                    }
                    return prev;
                });
                setTimeout(() => createAndSendOffer(data.from), 1000);
                break;
            case 'user_left':
                setParticipants(prev => prev.filter(user => user !== data.from));
                if (peerConnections.current[data.from]) {
                    peerConnections.current[data.from].close();
                    delete peerConnections.current[data.from];
                }
                setRemoteStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[data.from];
                    return newStreams;
                });
                break;
        }
    }, []);

    const initializeWebSocket = useCallback(async () => {
        try {
            const wsUrl = await getWebSocketUrl();
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                setIsConnected(true);
                setConnectionError(null);
            };

            ws.onclose = (event) => {
                setIsConnected(false);
                if (event.code !== 1000) {
                    setConnectionError('Соединение потеряно. Переподключение...');
                    setTimeout(initializeWebSocket, 3000);
                }
            };

            ws.onerror = (error) => {
                setConnectionError('Ошибка подключения к серверу видеозвонка');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            setConnectionError('Не удалось подключиться к серверу видеозвонка');
        }
    }, [getWebSocketUrl, handleWebSocketMessage]);

    const sendMessage = useCallback((message) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        } else {
            setConnectionError('Нет соединения с сервером видеозвонка');
            return false;
        }
    }, []);

    useEffect(() => {
        initializeWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
            }
            Object.values(peerConnections.current).forEach(pc => pc.close());
            peerConnections.current = {};
        };
    }, [initializeWebSocket]);

    return {
        isConnected,
        remoteStreams,
        chatMessages,
        participants,
        connectionError,
        sendMessage,
        reconnect: initializeWebSocket
    };
}