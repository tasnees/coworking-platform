'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDashboardPath } from '@/lib/utils/routes';

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    if (status === 'authenticated' && !isRedirecting) {
      setIsRedirecting(true);
      const role = (session?.user?.role?.toLowerCase() as 'admin' | 'staff' | 'member') || 'member';
      router.push(getDashboardPath(role));
    } else if (status === 'unauthenticated' && !isRedirecting) {
      setIsRedirecting(true);
      router.push('/home');
    }
  }, [status, session, isRedirecting, isClient, router]);

  // Show loading state while checking auth status
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
    </div>
  );
}
