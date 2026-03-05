import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Dashboard } from './pages/Dashboard';
import { ProjectsPage } from './pages/ProjectsPage';
import { FeedbackList } from './pages/FeedbackList';
import { AdminPanel } from './pages/AdminPanel';
import { CompanyPanel } from './pages/CompanyPanel';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './modules/auth/LoginPage';

import { ModeratorPanel } from './pages/ModeratorPanel';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/feedbacks" element={<FeedbackList />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/moderator" element={<ModeratorPanel />} />
            <Route path="/company" element={<CompanyPanel />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}
