import { apiRequest } from '../../services/apiService';
import { mockUsers } from './mockUsers';
import { IS_MOCK } from '../../config/env';

// Initialize mock data in localStorage
if (IS_MOCK) {
  localStorage.setItem('mock_users', JSON.stringify(mockUsers));
}

export const login = async (username: string, password: string) => {
  if (IS_MOCK) {
    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
    console.log('[DEBUG] Mock users in localStorage:', users);
    console.log('[DEBUG] Attempting login for username:', username, 'password:', password);
    const user = users.find((u: any) => 
      u.username.trim().toLowerCase() === username.trim().toLowerCase() && 
      u.password === password.trim()
    );
    
    if (user) {
      console.log('[DEBUG] User found:', user);
      return { success: true, data: user, error: null };
    } else {
      console.log('[DEBUG] User not found. Check if username/password match exactly.');
      return { success: false, data: null, error: 'Invalid credentials' };
    }
  } else {
    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        return { success: true, data, error: null };
      }
      return { success: false, data: null, error: data.message || 'Invalid credentials' };
    } catch {
      return { success: false, data: null, error: 'Network error' };
    }
  }
};
