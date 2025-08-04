'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Custom500() {
  // Log the error to your error reporting service
  useEffect(() => {
    console.error('500 - Server-side error occurred');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-red-500">500</h1>
        <h2 className="text-2xl font-semibold mt-4">Something went wrong</h2>
        <p className="text-muted-foreground mt-2">
          We're experiencing technical difficulties. Please try again later.
        </p>
        <div className="mt-6">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
