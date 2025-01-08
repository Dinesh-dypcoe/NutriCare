import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials)
};

export const patientAPI = {
    getAll: () => api.get('/manager/patients'),
    getById: (id) => api.get(`/manager/patients/${id}`),
    create: (data) => api.post('/manager/patients', data),
    update: (id, data) => api.put(`/manager/patients/${id}`, data),
    delete: (id) => api.delete(`/manager/patients/${id}`)
};

export const dietChartAPI = {
    getAll: () => api.get('/manager/diet-charts'),
    getById: (id) => api.get(`/manager/diet-charts/${id}`),
    create: (data) => api.post('/manager/diet-charts', data),
    update: (id, data) => api.put(`/manager/diet-charts/${id}`, data),
    delete: (id) => api.delete(`/manager/diet-charts/${id}`)
};

export default api; 