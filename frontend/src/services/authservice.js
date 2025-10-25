import axios from 'axios';
import { tokenService } from '../utils/tokenService';

// 🔥 MOCK ДАННЫЕ ДЛЯ РАЗРАБОТКИ
const mockUser = {
    id: 1,
    email: 'user@example.com',
    name: 'Тестовый Пользователь',
    avatar: '👨‍💻',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
};

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 🔥 MOCK ИНТЕРЦЕПТОР - ВСЕГДА УСПЕШНЫЙ ОТВЕТ
api.interceptors.request.use(
    (config) => {
        const token = tokenService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 🔥 MOCK ИНТЕРЦЕПТОР ОТВЕТОВ - ВСЕГДА УСПЕХ
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // В разработке всегда успешный ответ
        console.log('Mock: Intercepting error, returning success');
        return Promise.resolve({
            data: mockUser,
            status: 200,
            statusText: 'OK'
        });
    }
);

export const authService = {
    async register(userData) {
        console.log('Mock: Registering user', userData);
        // Имитация задержки
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Создаем mock токен
        tokenService.setToken('mock_jwt_token_' + Date.now());

        return {
            access_token: 'mock_jwt_token_' + Date.now(),
            user: mockUser
        };
    },

    async login(credentials) {
        console.log('Mock: Logging in', credentials);
        // Имитация задержки
        await new Promise(resolve => setTimeout(resolve, 800));

        // Создаем mock токен
        const mockToken = 'mock_jwt_token_' + Date.now();
        tokenService.setToken(mockToken);

        return {
            access_token: mockToken,
            user: mockUser
        };
    },

    async getProfile() {
        console.log('Mock: Getting profile');
        // Имитация задержки
        await new Promise(resolve => setTimeout(resolve, 500));

        // 🔥 ВСЕГДА ВОЗВРАЩАЕМ MOCK ПОЛЬЗОВАТЕЛЯ
        return mockUser;
    },

    async refreshToken() {
        console.log('Mock: Refreshing token');
        const newToken = 'mock_refreshed_token_' + Date.now();
        tokenService.setToken(newToken);
        return { access_token: newToken };
    },

    logout() {
        tokenService.removeTokens();
    }
};

export default api;