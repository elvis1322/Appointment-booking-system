import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry401?: boolean;
}

const baseURL =
    (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
    'http://localhost:5213/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

function clearSessionAndRedirectLogin() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
    }
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;
        const status = error.response?.status;
        const url = originalRequest?.url ?? '';

        const isAuthPublic =
            url.includes('/auth/login') ||
            url.includes('/auth/register') ||
            url.includes('/Auth/login') ||
            url.includes('/Auth/register');

        if (status === 401 && originalRequest && !originalRequest._retry401 && !isAuthPublic) {
            originalRequest._retry401 = true;
            clearSessionAndRedirectLogin();
        }

        return Promise.reject(error);
    }
);

export default api;
