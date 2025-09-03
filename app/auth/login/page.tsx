// app/auth/login/page.tsx
"use client";

export const dynamic = "force-dynamic";
import { signIn, useSession, getSession } from 'next-auth/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Suspense, useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { RoleSelect } from '@/components/ui/role-select';
import { getDashboardPath } from '@/lib/utils/routes';

type UserRole = 'member' | 'staff' | 'admin';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams() || new URLSearchParams();
  const pathname = usePathname();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  
  // Memoize the callback URL to prevent unnecessary re-renders
  const callbackUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      return url.searchParams.get('callbackUrl') || '/dashboard';
    }
    return '/dashboard';
  }, []);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    const handleRedirect = async () => {
      if (status === 'authenticated' && session?.user?.role) {
        // Get the intended URL from the callbackUrl or use the role-based dashboard
        const callbackUrl = searchParams?.get('callbackUrl');
        const role = session.user.role as UserRole;
        const defaultPath = getDashboardPath(role);
        
        // Small delay to ensure session is fully loaded
        const timer = setTimeout(() => {
          // If there's a callback URL that's not an auth route, use it
          if (callbackUrl && !callbackUrl.startsWith('/auth/')) {
            try {
              const url = new URL(callbackUrl, window.location.origin);
              // Only allow redirecting to dashboard paths
              if (url.pathname.startsWith('/dashboard')) {
                // Verify the user has access to the requested dashboard
                if (
                  (url.pathname.startsWith('/dashboard/admin') && role !== 'admin') ||
                  (url.pathname.startsWith('/dashboard/staff') && !['admin', 'staff'].includes(role))
                ) {
                  // If user doesn't have access, redirect to their default dashboard
                  window.location.href = defaultPath;
                } else {
                  window.location.href = callbackUrl;
                }
              } else {
                window.location.href = callbackUrl;
              }
            } catch (e) {
              console.error('Invalid callback URL:', callbackUrl);
              window.location.href = defaultPath;
            }
          } else {
            // No callback URL or it's an auth route, use the role-based dashboard
            window.location.href = defaultPath;
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    };

    handleRedirect();
  }, [status, session, searchParams]);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Use signIn from next-auth/react
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/dashboard' // This will be handled by our redirect callback
      });

      if (result?.error) {
        // Map specific error messages to user-friendly text
        const errorMessages: Record<string, string> = {
          'No user found with this email': 'No account found with this email',
          'Incorrect password': 'Incorrect password',
          'Authentication failed': 'Authentication failed. Please try again.',
          'This account is not active': 'This account is not active. Please contact support.',
          'CredentialsSignin': 'Invalid credentials. Please check your email and password.'
        };
        
        const friendlyMessage = errorMessages[result.error] || 'An error occurred during login';
        throw new Error(friendlyMessage);
      }

      // If we have a callback URL from the result, use it
      if (result?.url) {
        // The URL will already include the correct dashboard path from our redirect callback
        window.location.href = result.url;
        return;
      }
      
      // If no URL was returned, redirect to the default dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred during login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
        </form>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Don't have an account?</span>
          </div>
        </div>

        <div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/auth/register')}
            disabled={isLoading}
          >
            Create a new account
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
