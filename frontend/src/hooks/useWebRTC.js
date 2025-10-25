import { useRef, useCallback } from 'react';

export function useWebRTC() {
    const peerConnections = useRef({});
    const localStream = useRef(null);

    const createPeerConnection = useCallback(function(userId) {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };

        const pc = new RTCPeerConnection(configuration);

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                pc.addTrack(track, localStream.current);
            });
        }

        pc.onicecandidate = function(event) {
            if (event.candidate && window.ws) {
                window.ws.send(JSON.stringify({
                    type: 'ice_candidate',
                    to: userId,
                    data: { candidate: event.candidate }
                }));
            }
        };

        pc.ontrack = function(event) {
            const remoteStream = event.streams[0];
            console.log('Received remote stream from:', userId, remoteStream);
        };

        peerConnections.current[userId] = pc;
        return pc;
    }, []);

    const createOffer = useCallback(async function(userId) {
        const pc = createPeerConnection(userId);
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            if (window.ws) {
                window.ws.send(JSON.stringify({
                    type: 'webrtc_offer',
                    to: userId,
                    data: { sdp: offer }
                }));
            }
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }, [createPeerConnection]);

    const createAnswer = useCallback(async function(userId, offerSdp) {
        const pc = createPeerConnection(userId);
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            return answer;
        } catch (error) {
            console.error('Error creating answer:', error);
        }
    }, [createPeerConnection]);

    const addIceCandidate = useCallback(async function(userId, candidate) {
        const pc = peerConnections.current[userId];
        if (pc) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        }
    }, []);

    const startCall = useCallback(function() {
        console.log('Starting call...');
    }, []);

    return {
        startCall,
        createOffer,
        createAnswer,
        addIceCandidate,
        peerConnections
    };
}