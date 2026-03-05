'use client';
import { DashboardData } from '../types';

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  if (!userId) throw new Error('User not logged in');

  const response = await fetch(`/api/user/dashboard/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  return response.json();
};
