const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenService = {
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
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
        return !!this.getToken();
    },

    getTokenPayload() {
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
        const payload = this.getTokenPayload();
        if (!payload || !payload.exp) return true;
        return payload.exp * 1000 < Date.now();
    }
};