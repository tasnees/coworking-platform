'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const DashboardLayout = dynamic(
  () => import('@/components/dashboard-layout'),
  { ssr: false }
);

export default function MemberLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardLayout userRole="member">
      {children}
    </DashboardLayout>
  );
}
