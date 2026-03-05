'use client';
import dynamic from 'next/dynamic';
const Dashboard = dynamic(() => import('@/panels/Dashboard').then((m) => ({ default: m.Dashboard })), { ssr: false });
export default function DashboardPage() { return <Dashboard />; }
