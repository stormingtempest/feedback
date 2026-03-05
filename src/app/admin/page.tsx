'use client';
import dynamic from 'next/dynamic';
const AdminPanel = dynamic(() => import('@/panels/AdminPanel').then((m) => ({ default: m.AdminPanel })), { ssr: false });
export default function AdminPage() { return <AdminPanel />; }
