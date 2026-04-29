/**
 * API Service
 * Handles all HTTP requests to the Flask backend
 */

import axios from 'axios';
import { getCurrentUserToken } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    async (config) => {
        const token = await getCurrentUserToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    verify: (idToken) => api.post('/auth/verify', { idToken }),
    getUser: () => api.get('/auth/user'),
};

// Activities API
export const activitiesAPI = {
    create: (activityData) => api.post('/activities', activityData),
    getAll: (params = {}) => api.get('/activities', { params }),
    update: (id, activityData) => api.put(`/activities/${id}`, activityData),
    delete: (id) => api.delete(`/activities/${id}`),
};

// Calculations API
export const calculationsAPI = {
    calculate: (activityData) => api.post('/calculations/calculate', activityData),
    getStats: () => api.get('/calculations/stats'),
    getBreakdown: (days = 30) => api.get('/calculations/breakdown', { params: { days } }),
    getTrends: (days = 30) => api.get('/calculations/trends', { params: { days } }),
};

// Recommendations API
export const recommendationsAPI = {
    get: (days = 30) => api.get('/recommendations', { params: { days } }),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
