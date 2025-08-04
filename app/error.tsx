'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('An error occurred:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-red-500 mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          We're experiencing technical difficulties. Please try again later.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
