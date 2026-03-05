'use client';
import dynamic from 'next/dynamic';
const ProjectsPage = dynamic(() => import('@/panels/ProjectsPage').then((m) => ({ default: m.ProjectsPage })), { ssr: false });
export default function Projects() { return <ProjectsPage />; }
