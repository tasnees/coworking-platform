'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { UserRole } from '@/lib/auth-types';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  [key: string]: unknown; // Allow additional properties
}

export default function ProfilePage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/login?callbackUrl=/dashboard/member/profile');
    },
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will be redirected by onUnauthenticated
  }

  const user = session.user as SessionUser;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative h-24 w-24 rounded-full overflow-hidden">
                <img
                  src={(session.user as any)?.image || '/default-avatar.png'}
                  alt={(session.user as any)?.name || 'User'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <h3 className="font-semibold">Account Type</h3>
                <p className="capitalize">{user.role || 'member'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Account Status</h3>
                <p className="text-green-600">Active</p>
              </div>
            </div>

            <div className="pt-6">
              <Button 
                variant="outline"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full sm:w-auto"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
