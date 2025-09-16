import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { getDashboardPath } from '@/lib/utils/routes';

// Generate static params for this route
export async function generateStaticParams() {
  // For static export, return an empty array since we don't know the params in advance
  // The actual params will be handled client-side
  return [];
}


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  // If no session, redirect to login
  if (!session?.user) {
    const loginUrl = new URL('/auth/login', process.env.NEXTAUTH_URL || 'https://coworking-platform.onrender.com');
    loginUrl.searchParams.set('callbackUrl', '/dashboard');
    redirect(loginUrl.toString());
  }
  
  // Redirect based on user role
  const role = (session.user.role?.toLowerCase() as 'admin' | 'staff' | 'member') || 'member';
  redirect(getDashboardPath(role));
}
