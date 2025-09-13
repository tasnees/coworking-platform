// components/auth/LogoutButton.tsx
'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function LogoutButton({ className = '', redirectPath = '/' }: { className?: string; redirectPath?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Sign out using NextAuth
      await signOut({
        redirect: false,
        callbackUrl: redirectPath
      });

      // Clear client-side storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Show success message
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      
      // Force a full page reload to clear all state
      window.location.href = redirectPath;
      
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={isLoading}
      className={`flex items-center gap-2 hover:bg-gray-100 transition-colors ${className}`}
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
}
