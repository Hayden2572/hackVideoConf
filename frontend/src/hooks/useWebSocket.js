import { useState, useEffect, useCallback } from 'react';

export function useWebSocket(roomId, userId) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(function() {
        const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}/${userId}`);

        ws.onopen = function() {
            setIsConnected(true);
            console.log('WebSocket connected');
        };

        ws.onclose = function() {
            setIsConnected(false);
            console.log('WebSocket disconnected');
        };

        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
        };

        window.ws = ws;

        return function() {
            ws.close();
            delete window.ws;
        };
    }, [roomId, userId]);

    const sendMessage = useCallback(function(message) {
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            window.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected');
        }
    }, []);

    return {
        isConnected,
        sendMessage
    };
}