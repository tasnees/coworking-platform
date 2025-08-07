"use client"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function NotFound() {
  const router = useRouter();
  // Optional: Redirect to home after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="mb-4 text-6xl font-bold">404</h1>
      <h2 className="mb-6 text-2xl">Page not found</h2>
      <p className="mb-8 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/" 
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go back home
      </Link>
      <p className="mt-4 text-sm text-muted-foreground">
        Redirecting you to the homepage in 5 seconds...
      </p>
    </div>
  );
}
