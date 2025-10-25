import api from './authService';

export const roomService = {
    async createRoom(roomData) {
        try {
            const response = await api.post('/rooms/', {
                name: roomData.roomName,
                description: roomData.description || `Комната: ${roomData.roomName}`,
                max_participants: roomData.maxParticipants || 10
            });

            const backendRoom = response.data;

            return {
                roomId: backendRoom.room_id,
                roomName: backendRoom.name,
                description: backendRoom.description,
                maxParticipants: backendRoom.max_participants,
                createdBy: backendRoom.created_by,
                isActive: backendRoom.is_active,
                createdAt: backendRoom.created_at,
                inviteLink: backendRoom.invite_link || `/room/${backendRoom.room_id}`
            };
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to create room');
        }
    },

    async getRoom(roomId) {
        try {
            const response = await api.get(`/rooms/${roomId}`);
            const backendRoom = response.data;

            return {
                roomId: backendRoom.room_id,
                roomName: backendRoom.name,
                description: backendRoom.description,
                maxParticipants: backendRoom.max_participants,
                createdBy: backendRoom.created_by,
                isActive: backendRoom.is_active,
                participants: backendRoom.participants || []
            };
        } catch (error) {
            throw new Error('Room not found');
        }
    },

    async joinRoom(roomId) {
        try {
            const response = await api.post(`/rooms/${roomId}/join`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to join room');
        }
    },

    async validateRoom(roomId) {
        try {
            await this.getRoom(roomId);
            return true;
        } catch (error) {
            return false;
        }
    },

    async getRoomParticipants(roomId) {
        try {
            const response = await api.get(`/rooms/${roomId}/participants`);
            return response.data.map(p => ({
                id: p.user.id,
                name: p.user.name,
                email: p.user.email,
                role: p.role,
                joinedAt: p.joined_at
            }));
        } catch (error) {
            return [];
        }
    }
};