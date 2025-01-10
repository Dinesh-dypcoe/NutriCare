import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add request logging
api.interceptors.request.use(request => {
    console.log('API Request:', {
        url: request.url,
        method: request.method,
        headers: request.headers,
        data: request.data
    });
    return request;
}, error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
});

// Response interceptor for handling errors
api.interceptors.response.use(
    response => {
        console.log('API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    error => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
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