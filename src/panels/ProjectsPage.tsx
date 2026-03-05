'use client';
import { FolderKanban } from 'lucide-react';

export const ProjectsPage = () => {
  return (
    <div className="p-10 flex flex-col items-center justify-center h-full space-y-4 text-slate-400">
      <FolderKanban size={64} />
      <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
      <p>Project listing page in development.</p>
    </div>
  );
};
