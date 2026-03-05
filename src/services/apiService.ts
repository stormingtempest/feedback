import { IS_MOCK } from '../config/env';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export async function apiRequest<T>(action: string, params: any = {}): Promise<ApiResponse<T>> {
  if (IS_MOCK) {
    console.log(`[MOCK] Action: ${action}`, params);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Example: Handle localStorage for mock data
    const key = `mock_${action}`;
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : null;
    
    return { success: true, data, error: null };
  } else {
    try {
      const response = await fetch('api/api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, data: null, error: 'Network error' };
    }
  }
}
