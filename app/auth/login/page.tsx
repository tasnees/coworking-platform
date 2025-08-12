"use client";

export const dynamic = "force-dynamic";
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
function LoginForm() {
  const searchParams = useSearchParams();
  const [callbackUrl, setCallbackUrl] = useState('/dashboard');
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Ensure we're on the client side before accessing searchParams
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCallback = urlParams.get('callbackUrl');
      const urlError = urlParams.get('error');
      
      setCallbackUrl(urlCallback || '/dashboard');
      setError(urlError);
    }
  }, []);
  const handleAuth0Login = () => {
    signIn('auth0', { callbackUrl });
  };
  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Failed to sign in. Please try again.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 space-y-6">
          <Button
            onClick={handleAuth0Login}
            className="w-full justify-center bg-[#eb5424] hover:bg-[#d04a1f]"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M11.984 0A10 10 0 0 0 2 10a9.8 9.8 0 0 0 1.4 5.1l-1.4 1.4 1.4 1.4 1.4-1.4a9.8 9.8 0 0 0 5.1 1.4 10 10 0 1 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
            </svg>
            Continue with Auth0
          </Button>
        </div>
      </div>
    </div>
  );
}
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
