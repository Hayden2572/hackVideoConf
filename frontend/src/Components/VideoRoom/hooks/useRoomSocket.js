import { useState, useEffect, useCallback, useRef } from 'react';

export function useRoomSocket(roomId, localStream) {
    const [isConnected, setIsConnected] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [chatMessages, setChatMessages] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [connectionError, setConnectionError] = useState(null);

    const peerConnections = useRef({});
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // Конфигурация WebRTC
    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    // Создание PeerConnection для пользователя
    const createPeerConnection = useCallback((userId) => {
        if (peerConnections.current[userId]) {
            return peerConnections.current[userId];
        }

        const pc = new RTCPeerConnection(rtcConfig);

        // Добавляем локальные треки
        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        // Обработчик ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'ice_candidate',
                    to: userId,
                    data: { candidate: event.candidate }
                }));
            }
        };

        // Обработчик удаленных потоков
        pc.ontrack = (event) => {
            const remoteStream = event.streams[0];
            setRemoteStreams(prev => ({
                ...prev,
                [userId]: remoteStream
            }));
        };

        // Обработчик изменения состояния соединения
        pc.onconnectionstatechange = () => {
            console.log(`Connection state for ${userId}:`, pc.connectionState);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                // Удаляем неактивное соединение
                setRemoteStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[userId];
                    return newStreams;
                });
                delete peerConnections.current[userId];
            }
        };

        peerConnections.current[userId] = pc;
        return pc;
    }, [localStream]);

    // Создание и отправка offer
    const createAndSendOffer = useCallback(async (userId) => {
        try {
            const pc = createPeerConnection(userId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'webrtc_offer',
                    to: userId,
                    data: { sdp: offer }
                }));
            }
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }, [createPeerConnection]);

    // Обработка входящего offer
    const handleOffer = useCallback(async (fromUserId, offerSdp) => {
        try {
            const pc = createPeerConnection(fromUserId);
            await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'webrtc_answer',
                    to: fromUserId,
                    data: { sdp: answer }
                }));
            }
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }, [createPeerConnection]);

    // Обработка входящего answer
    const handleAnswer = useCallback(async (fromUserId, answerSdp) => {
        try {
            const pc = peerConnections.current[fromUserId];
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answerSdp));
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }, []);

    // Обработка ICE candidate
    const handleIceCandidate = useCallback(async (fromUserId, candidate) => {
        try {
            const pc = peerConnections.current[fromUserId];
            if (pc && pc.remoteDescription) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }, []);

    // Отправка сообщений
    const sendMessage = useCallback((message) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        } else {
            console.error('WebSocket is not connected');
            setConnectionError('Нет соединения с сервером');
            return false;
        }
    }, []);

    // Переподключение с экспоненциальной задержкой
    const reconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        const delay = Math.min(1000 * Math.pow(2, participants.length), 30000);

        reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            initializeWebSocket();
        }, delay);
    }, [participants.length]);

    // Инициализация WebSocket соединения
    const initializeWebSocket = useCallback(() => {
        const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
            const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}/${userId}`);

            ws.onopen = () => {
                console.log('WebSocket connected successfully');
                setIsConnected(true);
                setConnectionError(null);

                // Очищаем таймер переподключения при успешном соединении
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);

                // Не переподключаемся при нормальном закрытии
                if (event.code !== 1000) {
                    setConnectionError('Соединение потеряно. Переподключение...');
                    reconnect();
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionError('Ошибка соединения');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Received message:', data);

                    switch(data.type) {
                        case 'webrtc_offer':
                            handleOffer(data.from, data.data.sdp);
                            break;

                        case 'webrtc_answer':
                            handleAnswer(data.from, data.data.sdp);
                            break;

                        case 'ice_candidate':
                            handleIceCandidate(data.from, data.data.candidate);
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
                            setParticipants(prev => [...prev, data.from]);

                            // Создаем offer для нового пользователя
                            if (data.from !== userId) {
                                createAndSendOffer(data.from);
                            }
                            break;

                        case 'user_left':
                            console.log('User left:', data.from);
                            setParticipants(prev => prev.filter(user => user !== data.from));

                            // Закрываем PeerConnection
                            if (peerConnections.current[data.from]) {
                                peerConnections.current[data.from].close();
                                delete peerConnections.current[data.from];
                            }

                            // Удаляем поток
                            setRemoteStreams(prev => {
                                const newStreams = { ...prev };
                                delete newStreams[data.from];
                                return newStreams;
                            });
                            break;

                        case 'media_toggle':
                            console.log('Media toggle from:', data.from, data.data);
                            // Можно добавить визуальные индикаторы для других пользователей
                            break;

                        default:
                            console.warn('Unknown message type:', data.type);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            wsRef.current = ws;

        } catch (error) {
            console.error('Error creating WebSocket:', error);
            setConnectionError('Не удалось подключиться к серверу');
            reconnect();
        }
    }, [roomId, handleOffer, handleAnswer, handleIceCandidate, createAndSendOffer, reconnect]);

    // Основной эффект для инициализации
    useEffect(() => {
        initializeWebSocket();

        // Очистка при размонтировании
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
            }

            // Закрываем все PeerConnection
            Object.values(peerConnections.current).forEach(pc => pc.close());
            peerConnections.current = {};
        };
    }, [initializeWebSocket]);

    // Эффект для обновления локальных треков при изменении localStream
    useEffect(() => {
        if (localStream) {
            Object.values(peerConnections.current).forEach(pc => {
                // Удаляем старые треки
                const senders = pc.getSenders();
                senders.forEach(sender => {
                    if (sender.track && localStream.getTracks().includes(sender.track)) {
                        pc.removeTrack(sender);
                    }
                });

                // Добавляем новые треки
                localStream.getTracks().forEach(track => {
                    pc.addTrack(track, localStream);
                });
            });
        }
    }, [localStream]);

    return {
        isConnected,
        remoteStreams,
        chatMessages,
        participants,
        connectionError,
        sendMessage,
        reconnect: () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            initializeWebSocket();
        }
    };
}