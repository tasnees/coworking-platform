'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from './reset-password-form';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string>('');
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // First, check for token in URL hash (for client-side redirects)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const tokenFromHash = params.get('token');
      if (tokenFromHash) {
        setToken(tokenFromHash);
        // Remove the hash from the URL without refreshing
        window.history.replaceState(null, '', window.location.pathname);
        setLoading(false);
        return;
      }
    }

    // If no hash, check for token in search params (direct link)
    const tokenFromParams = searchParams?.get('token') || '';
    setToken(tokenFromParams);
    setLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Invalid or Expired Link</h1>
        <p className="text-gray-600">
          The password reset link is invalid or has expired. Please request a new password reset link.
        </p>
        <button
          onClick={() => router.push('/auth/forgot-password')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Request New Reset Link
        </button>
      </div>
    );
  }
  
  return <ResetPasswordForm token={token} />;
}