import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Timetables API
export const timetablesAPI = {
  getAll: (params) => api.get('/timetables', { params }),
  getById: (id) => api.get(`/timetables/${id}`),
  create: (data) => api.post('/timetables', data),
  update: (id, data) => api.put(`/timetables/${id}`, data),
  delete: (id) => api.delete(`/timetables/${id}`),
  approve: (id) => api.post(`/timetables/${id}/approve`),
  reject: (id, reason) => api.post(`/timetables/${id}/reject`, { reason }),
  submit: (id) => api.post(`/timetables/${id}/submit`),
};

// Classrooms API
export const classroomsAPI = {
  getAll: (params) => api.get('/classrooms', { params }),
  getById: (id) => api.get(`/classrooms/${id}`),
  create: (data) => api.post('/classrooms', data),
  update: (id, data) => api.put(`/classrooms/${id}`, data),
  delete: (id) => api.delete(`/classrooms/${id}`),
  getAvailable: (day, time) => api.get(`/classrooms/available/${day}/${time}`),
};

// Subjects API
export const subjectsAPI = {
  getAll: (params) => api.get('/subjects', { params }),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  getByDepartment: (department, params) => api.get(`/subjects/department/${department}`, { params }),
};

// Faculties API
export const facultiesAPI = {
  getAll: (params) => api.get('/faculties', { params }),
  getById: (id) => api.get(`/faculties/${id}`),
  create: (data) => api.post('/faculties', data),
  update: (id, data) => api.put(`/faculties/${id}`, data),
  delete: (id) => api.delete(`/faculties/${id}`),
  getByDepartment: (department) => api.get(`/faculties/department/${department}`),
  getBySubject: (subjectId) => api.get(`/faculties/subject/${subjectId}`),
  updateSubjects: (id, subjects) => api.put(`/faculties/${id}/subjects`, { subjects }),
};

// Students API
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getByBatch: (batch, params) => api.get(`/students/batch/${batch}`, { params }),
  getByDepartment: (department, params) => api.get(`/students/department/${department}`, { params }),
  updateSubjects: (id, subjects) => api.put(`/students/${id}/subjects`, { subjects }),
};

// Optimization API
export const optimizationAPI = {
  generate: (constraints) => api.post('/optimization/generate', { constraints }),
  getSuggestions: (timetableId) => api.post('/optimization/suggestions', { timetableId }),
};

export default api;
