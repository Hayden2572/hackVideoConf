export interface WebSocketMessage {
    type: 'webrtc_offer' | 'webrtc_answer' | 'ice_candidate' | 'chat_message' | 'media_toggle' | 'user_joined' | 'user_left';
    from: string;
    to: string;
    data: any;
}

export interface WebRTCData {
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
}

export interface ChatMessageData {
    text: string;
    timestamp: string;
}

export interface MediaToggleData {
    video: boolean;
    audio: boolean;
}

export interface UserJoinedData {
    users: string[];
}