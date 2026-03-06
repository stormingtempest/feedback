export interface Project {
  id: string;
  name: string;
  companyName: string;
  description: string;
}

export interface UserFeedbackCard {
  id: string;
  category: 'bug' | 'praise' | 'suggestion' | 'question';
  description: string;
  moderationStatus: string;
  files: string[];
  link?: string | null;
  companyResponse?: string | null;
  createdAt: string;
}

export interface FeedbackHistory {
  id: string;
  projectName: string;
  date: string;
  status: 'Completed' | 'In Review' | 'Pending';
  progress: number; // 0 to 100
  description?: string;
  points?: number;
}

export interface Achievement {
  id: string;
  icon: string;
  label: string;
  color: string;
  description: string;
  unlocked: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  completed: boolean;
}

export interface UserStats {
  id?: string;
  name: string;
  email?: string;
  level: number;
  levelTitle: string;
  points: number;
  nextLevelPoints: number;
  description?: string;
  avatarSeed?: string;
  lastNameChange?: string | Date; // ISO date string or Date object
  googleId?: string;
  discordId?: string;
  achievements: Achievement[];
  missions: Mission[];
}

export interface DashboardData {
  user: UserStats;
  activeProjects: Project[];
  history: FeedbackHistory[];
}
