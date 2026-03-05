import { DashboardData } from "../types";
import { IS_MOCK } from "../config/env";
import { mockDashboardData } from "./mockData";

export const fetchDashboardData = async (): Promise<DashboardData> => {
  if (IS_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter active projects to only show those that have a companyName (simulating company-provided projects)
    const filteredData = {
      ...mockDashboardData,
      activeProjects: mockDashboardData.activeProjects.filter(p => p.companyName && p.companyName.trim() !== '')
    };
    
    return filteredData;
  }

  const userId = localStorage.getItem('userId');
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await fetch(`/api/user/dashboard/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  
  return response.json();
};
