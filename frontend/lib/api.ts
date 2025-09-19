import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001'; // Use localhost instead of 0.0.0.0

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner: User;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project: Project;
  assignedTo?: User;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, role: string) =>
    api.post('/users', { name, email, password, role }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: Partial<User>) => api.put('/users/profile', data),
  getAll: () => api.get('/users'),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string; ownerEmail: string }) =>
    api.post('/projects', data),
  update: (id: string, data: Partial<Project>) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  getByProject: (projectId: string) => api.get(`/tasks/project/${projectId}`),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: {
    title: string;
    description: string;
    projectId: string;
    assignedToId?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in_progress' | 'done';
    due_date?: string;
    dependsOnIds?: string[];
  }) => api.post('/tasks', data),
  update: (id: string, data: Partial<Task>) => api.patch(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  getTopoSort: (projectId: string) => api.get(`/tasks/topo/${projectId}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};
