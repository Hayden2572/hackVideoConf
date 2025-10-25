import React, { useRef, useEffect } from 'react';

export default function RemoteVideo({ userId, stream }) {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative bg-white rounded-2xl overflow-hidden w-80 h-80 flex-shrink-0 border-2 border-secondary-500 shadow-lg">
            <video
                ref={videoRef}
                autoPlay
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-secondary-500 text-white px-3 py-1 text-sm rounded-lg font-medium">
                {userId}
            </div>
        </div>
    );
}