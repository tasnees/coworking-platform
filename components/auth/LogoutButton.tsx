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
      // Sign out and prevent automatic redirect
      await signOut({ 
        redirect: false,
        callbackUrl: '/' // Set the callback URL to the main page
      });
      
      // Clear any client-side state or cache if needed
      if (typeof window !== 'undefined') {
        // Clear any stored data in localStorage if needed
        localStorage.clear();
      }
      
      // Show success message
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      
      // Redirect to the main page
      router.push('/');
      router.refresh();
      
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
