'use client';

import dynamic from 'next/dynamic';

const DashboardLayout = dynamic(
  () => import('@/components/dashboard-layout'),
  { ssr: false }
);

export default function SettingsWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout userRole="member">
      {children}
    </DashboardLayout>
  );
}
