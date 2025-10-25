import React, { useMemo } from 'react';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';

export default React.memo(function VideoGrid({ localStream, remoteStreams, isVideoOn }) {
    const totalVideos = useMemo(() =>
            Object.keys(remoteStreams).length + 1,
        [remoteStreams]);

    const remoteVideoEntries = useMemo(() =>
            Object.entries(remoteStreams),
        [remoteStreams]);

    return (
        <div className="flex-1 flex flex-wrap gap-6 p-6 justify-center items-center overflow-auto">
            <LocalVideo
                stream={localStream}
                isVideoOn={isVideoOn}
            />

            {remoteVideoEntries.map(([userId, stream]) => (
                <RemoteVideo
                    key={userId}
                    userId={userId}
                    stream={stream}
                />
            ))}

            {totalVideos === 1 && (
                <div className="flex flex-col items-center justify-center text-gray-500 bg-white rounded-2xl p-8 shadow-lg">
                    <div className="text-6xl mb-4 text-primary-500">👥</div>
                    <div className="text-lg font-medium text-gray-700">Ожидаем участников...</div>
                    <div className="text-sm mt-2 text-gray-500">Поделитесь ссылкой на комнату</div>
                </div>
            )}
        </div>
    );
});