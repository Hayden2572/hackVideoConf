const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Флаг для отключения авторизации
const AUTH_DISABLED = true; //true=vikl false=vkl
const DEMO_TOKEN = 'demo-token-12345';

export const tokenService = {
    setToken(token) {
        if (AUTH_DISABLED) return;
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken() {
        if (AUTH_DISABLED) return DEMO_TOKEN;
        return localStorage.getItem(TOKEN_KEY);
    },

    setRefreshToken(token) {
        if (AUTH_DISABLED) return;
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    getRefreshToken() {
        if (AUTH_DISABLED) return DEMO_TOKEN;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    removeTokens() {
        if (AUTH_DISABLED) return;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    hasToken() {
        if (AUTH_DISABLED) return true;
        return !!this.getToken();
    },

    getTokenPayload() {
        if (AUTH_DISABLED) {
            // Возвращаем демо-пейлоад
            return {
                user_id: 1,
                email: 'demo@example.com',
                exp: Date.now() / 1000 + 3600 // через 1 час
            };
        }

        const token = this.getToken();
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch {
            return null;
        }
    },

    isTokenExpired() {
        if (AUTH_DISABLED) return false;
        const payload = this.getTokenPayload();
        if (!payload || !payload.exp) return true;
        return payload.exp * 1000 < Date.now();
    }
};