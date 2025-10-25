const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenService = {
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken() {
        // 🔥 ВСЕГДА ВОЗВРАЩАЕМ ВАЛИДНЫЙ MOCK ТОКЕН
        return localStorage.getItem(TOKEN_KEY) || 'mock_jwt_token_development';
    },

    setRefreshToken(token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    getRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    removeTokens() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    hasToken() {
        // 🔥 ВСЕГДА TRUE ДЛЯ РАЗРАБОТКИ
        return true;
    },

    getTokenPayload() {
        // 🔥 ВСЕГДА ВОЗВРАЩАЕМ ВАЛИДНЫЙ PAYLOAD
        return {
            userId: 'dev-user-1',
            email: 'dev@example.com',
            exp: Date.now() + 24 * 60 * 60 * 1000, // через 24 часа
            iat: Date.now()
        };
    },

    isTokenExpired() {
        // 🔥 ВСЕГДА FALSE ДЛЯ РАЗРАБОТКИ
        return false;
    }
};