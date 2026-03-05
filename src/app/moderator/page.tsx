'use client';
import dynamic from 'next/dynamic';
const ModeratorPanel = dynamic(() => import('@/panels/ModeratorPanel').then((m) => ({ default: m.ModeratorPanel })), { ssr: false });
export default function ModeratorPage() { return <ModeratorPanel />; }
