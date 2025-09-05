// components/auth/LogoutButton.tsx
'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function LogoutButton({ className = '' }: { className?: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // Clear any client-side state or cache first
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Sign out
      const data = await signOut({ 
        redirect: false,
        callbackUrl: '/'
      });
      
      // Show success message
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      
      // Force a hard redirect to ensure all state is cleared
      window.location.href = '/';
      
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className={`flex items-center gap-2 hover:bg-gray-100 transition-colors ${className}`}
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
}
