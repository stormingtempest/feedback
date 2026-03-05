'use client';
import { DashboardData } from '../types';
import { api } from '@/lib/axios-client';

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  if (!userId) throw new Error('User not logged in');

  const response = await api.get<DashboardData>(`/api/user/dashboard/${userId}`);
  return response.data;
};
