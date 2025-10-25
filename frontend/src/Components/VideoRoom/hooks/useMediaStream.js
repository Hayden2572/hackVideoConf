import { useState, useEffect, useCallback } from 'react';

export function useMediaStream() {
    const [localStream, setLocalStream] = useState(null);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [mediaError, setMediaError] = useState(null);

    const initializeMedia = useCallback(async () => {
        try {
            setMediaError(null);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            setLocalStream(stream);
            setIsVideoOn(true);
            setIsAudioOn(true);

        } catch (error) {
            console.error('Error accessing media devices:', error);
            setMediaError('Не удалось получить доступ к камере/микрофону');

            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true
                });
                setLocalStream(audioStream);
                setIsVideoOn(false);
                setIsAudioOn(true);
            } catch (audioError) {
                console.error('Error accessing audio only:', audioError);
            }
        }
    }, []);

    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    }, [localStream]);

    const toggleAudio = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioOn(audioTrack.enabled);
            }
        }
    }, [localStream]);


    const switchCamera = useCallback(async () => {
        if (!localStream) return;

        try {
            const videoTrack = localStream.getVideoTracks()[0];
            if (!videoTrack) return;

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices.length < 2) {
                console.log('Only one camera available');
                return;
            }

            const currentDeviceId = videoTrack.getSettings().deviceId;
            const newDevice = videoDevices.find(device => device.deviceId !== currentDeviceId) || videoDevices[0];

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: newDevice.deviceId } },
                audio: isAudioOn
            });

            const newVideoTrack = newStream.getVideoTracks()[0];
            const oldVideoTrack = localStream.getVideoTracks()[0];

            if (oldVideoTrack) {
                localStream.removeTrack(oldVideoTrack);
                oldVideoTrack.stop();
            }

            localStream.addTrack(newVideoTrack);
            setLocalStream(localStream.clone());

            newStream.getAudioTracks().forEach(track => track.stop());

        } catch (error) {
            console.error('Error switching camera:', error);
        }
    }, [localStream, isAudioOn]);

    useEffect(() => {
        initializeMedia();
    }, [initializeMedia]);

    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [localStream]);

    return {
        localStream,
        isVideoOn,
        isAudioOn,
        mediaError,
        toggleVideo,
        toggleAudio,
        switchCamera,
        reinitializeMedia: initializeMedia
    };
}