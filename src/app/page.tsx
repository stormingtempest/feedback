'use client';
import dynamic from 'next/dynamic';
const LandingPage = dynamic(() => import('@/panels/LandingPage').then((m) => ({ default: m.LandingPage })), { ssr: false });
export default function Home() { return <LandingPage />; }
