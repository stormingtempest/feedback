import axios from 'axios';

// Axios instance that auto-injects x-user-id from localStorage on every request
export const api = axios.create();

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('userId');
    if (userId) config.headers['x-user-id'] = userId;
  }
  return config;
});
