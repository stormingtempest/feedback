'use client';
import dynamic from 'next/dynamic';
const CompanyPanel = dynamic(() => import('@/panels/CompanyPanel').then((m) => ({ default: m.CompanyPanel })), { ssr: false });
export default function CompanyPage() { return <CompanyPanel />; }
