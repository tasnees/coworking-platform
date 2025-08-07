"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
// Dynamically import the MembersContent component with SSR disabled
const MembersContent = dynamic<{}>(
  () => import('./MembersContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
);
// This component ensures proper client-side rendering
export default function MembersPage() {
  const [isMounted, setIsMounted] = useState(false);
  // This effect ensures we don't render anything on the server
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  return <MembersContent />;
}
