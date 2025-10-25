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
    const userIdRef = useRef('');

    // Получаем WebSocket URL с уникальным ID пользователя
    const getWebSocketUrl = useCallback(async () => {
        try {
            const user = await authService.getProfile();
            userIdRef.current = `user-${user.id || 'demo'}-${Date.now()}`;
            return `ws://localhost:8000/ws/${roomId}/${userIdRef.current}`;
        } catch (error) {
            userIdRef.current = `user-demo-${Date.now()}`;
            return `ws://localhost:8000/ws/${roomId}/${userIdRef.current}`;
        }
    }, [roomId]);

    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    // Создание PeerConnection
    const createPeerConnection = useCallback((userId) => {
        if (peerConnections.current[userId]) {
            return peerConnections.current[userId];
        }

        console.log('Creating PeerConnection for:', userId);
        const pc = new RTCPeerConnection(rtcConfig);

        // Добавляем локальные треки
        if (localStream) {
            localStream.getTracks().forEach(track => {
                console.log('Adding track to peer connection:', track.kind);
                pc.addTrack(track, localStream);
            });
        }

        // Обработка ICE кандидатов
        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
                console.log('Sending ICE candidate to:', userId);
                wsRef.current.send(JSON.stringify({
                    type: 'ice_candidate',
                    to: userId,
                    data: {
                        candidate: event.candidate
                    }
                }));
            }
        };

        // Получение удаленного потока
        pc.ontrack = (event) => {
            console.log('Received remote track from:', userId);
            const remoteStream = event.streams[0];
            if (remoteStream) {
                setRemoteStreams(prev => ({
                    ...prev,
                    [userId]: remoteStream
                }));
            }
        };

        // Обработка изменения состояния соединения
        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${userId}:`, pc.connectionState);
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`ICE connection state with ${userId}:`, pc.iceConnectionState);
        };

        peerConnections.current[userId] = pc;
        return pc;
    }, [localStream]);

    // Обработка WebRTC offer
    const handleOffer = useCallback(async (fromUserId, sdp) => {
        try {
            console.log('Handling offer from:', fromUserId);
            const pc = createPeerConnection(fromUserId);
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log('Sending answer to:', fromUserId);
            wsRef.current.send(JSON.stringify({
                type: 'webrtc_answer',
                to: fromUserId,
                data: { sdp: answer }
            }));
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }, [createPeerConnection]);

    // Обработка WebRTC answer
    const handleAnswer = useCallback(async (fromUserId, sdp) => {
        try {
            console.log('Handling answer from:', fromUserId);
            const pc = peerConnections.current[fromUserId];
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }, []);

    // Обработка ICE candidate
    const handleIceCandidate = useCallback(async (fromUserId, candidate) => {
        try {
            console.log('Handling ICE candidate from:', fromUserId);
            const pc = peerConnections.current[fromUserId];
            if (pc && candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }, []);

    // Создание и отправка offer
    const createAndSendOffer = useCallback(async (toUserId) => {
        try {
            // Не создаем offer самому себе
            if (toUserId === userIdRef.current) {
                return;
            }

            console.log('Creating and sending offer to:', toUserId);
            const pc = createPeerConnection(toUserId);
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            await pc.setLocalDescription(offer);

            wsRef.current.send(JSON.stringify({
                type: 'webrtc_offer',
                to: toUserId,
                data: { sdp: offer }
            }));
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }, [createPeerConnection]);

    // Основной обработчик сообщений WebSocket
    const handleWebSocketMessage = useCallback((data) => {
        console.log('WebSocket message received:', data);

        switch(data.type) {
            case 'chat_message':
                setChatMessages(prev => [...prev, {
                    from: data.from,
                    text: data.data?.text,
                    timestamp: data.data?.timestamp || new Date().toISOString()
                }]);
                break;

            case 'user_joined':
                console.log('User joined:', data.from);
                // Обновляем список участников
                if (data.data?.users) {
                    setParticipants(data.data.users);
                }

                // Если это не наш пользователь, инициируем WebRTC соединение
                if (data.from && data.from !== userIdRef.current) {
                    console.log('Initiating WebRTC with new user:', data.from);
                    setTimeout(() => createAndSendOffer(data.from), 1000);
                }
                break;

            case 'user_left':
                console.log('User left:', data.from);
                if (data.data?.users) {
                    setParticipants(data.data.users);
                }

                // Закрываем WebRTC соединение
                if (data.from && peerConnections.current[data.from]) {
                    peerConnections.current[data.from].close();
                    delete peerConnections.current[data.from];
                }

                // Удаляем удаленный поток
                setRemoteStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[data.from];
                    return newStreams;
                });
                break;

            case 'room_state_sync':
                console.log('Room state sync received');
                // Синхронизация состояния комнаты
                if (data.data?.users) {
                    const userObjects = data.data.users;
                    const userIds = userObjects.map(user => user.id);
                    setParticipants(userIds);

                    // Инициируем соединения со всеми участниками (кроме себя)
                    userIds.forEach(userId => {
                        if (userId !== userIdRef.current) {
                            console.log('Initiating WebRTC with existing user:', userId);
                            setTimeout(() => createAndSendOffer(userId), 500);
                        }
                    });
                }
                break;

            case 'error':
                console.error('Server error:', data.data?.message);
                break;

            // WebRTC события - ОБРАБАТЫВАЕМ ИЗ data.data!
            case 'webrtc_offer':
                console.log('Received WebRTC offer from:', data.from);
                handleOffer(data.from, data.data?.sdp);
                break;

            case 'webrtc_answer':
                console.log('Received WebRTC answer from:', data.from);
                handleAnswer(data.from, data.data?.sdp);
                break;

            case 'ice_candidate':
                console.log('Received ICE candidate from:', data.from);
                handleIceCandidate(data.from, data.data?.candidate);
                break;

            default:
                console.log('Unhandled message type:', data.type);
        }
    }, [createAndSendOffer, handleOffer, handleAnswer, handleIceCandidate]);

    // Инициализация WebSocket
    const initializeWebSocket = useCallback(async () => {
        try {
            const wsUrl = await getWebSocketUrl();
            console.log('Connecting to WebSocket:', wsUrl);

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ WebSocket connected to:', wsUrl);
                setIsConnected(true);
                setConnectionError(null);
            };

            ws.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
                setIsConnected(false);

                if (event.code !== 1000) {
                    setConnectionError('Соединение потеряно. Переподключение...');
                    setTimeout(initializeWebSocket, 3000);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionError('Ошибка подключения к серверу видеозвонка');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error, event.data);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            setConnectionError('Не удалось подключиться к серверу видеозвонка');
        }
    }, [getWebSocketUrl, handleWebSocketMessage]);

    // Функция отправки сообщений
    const sendMessage = useCallback((messageData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(messageData));
            console.log('Message sent:', messageData);
            return true;
        } else {
            console.warn('WebSocket not connected');
            setConnectionError('Нет соединения с сервером');
            return false;
        }
    }, []);

    // Удобная обертка для отправки сообщений в чат
    const sendChatMessage = useCallback((text) => {
        return sendMessage({
            type: 'chat_message',
            to: 'all',
            data: {
                text: text,
                timestamp: new Date().toISOString()
            }
        });
    }, [sendMessage]);

    useEffect(() => {
        if (roomId) {
            console.log('Initializing WebSocket for room:', roomId);
            initializeWebSocket();
        }

        return () => {
            console.log('Cleaning up WebSocket and PeerConnections');
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
            }

            // Закрываем все Peer Connections
            Object.values(peerConnections.current).forEach(pc => {
                if (pc) {
                    pc.close();
                }
            });
            peerConnections.current = {};
        };
    }, [roomId, initializeWebSocket]);

    return {
        isConnected,
        remoteStreams,
        chatMessages,
        participants,
        connectionError,
        sendMessage,
        sendChatMessage,
        reconnect: initializeWebSocket
    };
}