import axios from 'axios';
import { tokenService } from '../utils/tokenService';

const API_URL = 'http://localhost:8000/api'; // URL вашего FastAPI бэкенда

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
            tokenService.removeTokens();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    async register(userData) {
        const response = await api.post('/register', userData);
        return response.data;
    },

    // Логин
    async login(credentials) {
        const response = await api.post('/login', credentials);

        if (response.data.access_token) {
            tokenService.setToken(response.data.access_token);
            if (response.data.refresh_token) {
                tokenService.setRefreshToken(response.data.refresh_token);
            }
        }

        return response.data;
    },

    async getProfile() {
        const response = await api.get('/users/me');
        return response.data;
    },

    async refreshToken() {
        const refreshToken = tokenService.getRefreshToken();
        const response = await api.post('/refresh', {
            refresh_token: refreshToken
        });

        if (response.data.access_token) {
            tokenService.setToken(response.data.access_token);
        }

        return response.data;
    },

    logout() {
        tokenService.removeTokens();
    }
};

export default api;