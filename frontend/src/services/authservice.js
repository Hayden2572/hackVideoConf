import axios from 'axios';
import { tokenService } from '../utils/tokenService';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                const newToken = await authService.refreshToken();
                if (newToken) {
                    const originalRequest = error.config;
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                tokenService.removeTokens();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    async register(userData) {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    async login(credentials) {
        const response = await api.post('/auth/login', credentials);

        if (response.data.access_token) {
            tokenService.setToken(response.data.access_token);
            if (response.data.refresh_token) {
                tokenService.setRefreshToken(response.data.refresh_token);
            }
        }

        return response.data;
    },

    async getProfile() {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            return {
                id: 1,
                email: 'demo@example.com',
                name: 'Демо пользователь',
                avatar: null
            };
        }
    },

    async refreshToken() {
        try {
            const refreshToken = tokenService.getRefreshToken();
            const response = await api.post('/auth/refresh', {
                refresh_token: refreshToken
            });

            if (response.data.access_token) {
                tokenService.setToken(response.data.access_token);
                return response.data.access_token;
            }
        } catch (error) {
            throw error;
        }
    },

    logout() {
        api.post('/auth/logout').catch(() => {}).finally(() => {
            tokenService.removeTokens();
        });
    },

    getToken() {
        return tokenService.getToken();
    }
};

export default api;