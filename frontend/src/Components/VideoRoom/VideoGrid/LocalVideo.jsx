import React, { useRef, useEffect } from 'react';

export default function LocalVideo({ stream, isVideoOn }) {
    const videoRef = useRef();

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="relative bg-white rounded-2xl overflow-hidden w-80 h-80 flex-shrink-0 border-2 border-primary-500 shadow-lg">
            <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-primary-500 text-white px-3 py-1 text-sm rounded-lg font-medium">
                Вы {!isVideoOn && '📹❌'}
            </div>

            {/* Overlay когда камера выключена */}
            {!isVideoOn && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-2xl">
                    <div className="text-center text-gray-600">
                        <div className="text-4xl mb-2">👤</div>
                        <div className="text-sm font-medium">Камера выключена</div>
                    </div>
                </div>
            )}
        </div>
    );
}