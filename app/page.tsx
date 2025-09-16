import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDashboardPath } from '@/lib/utils/routes';

// Generate static params for this route
export async function generateStaticParams() {
  // For static export, return an empty array since we don't know the params in advance
  // The actual params will be handled client-side
  return [];
}


export default async function RootPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    const role = (session.user.role?.toLowerCase() as 'admin' | 'staff' | 'member') || 'member';
    redirect(getDashboardPath(role));
  }
  
  redirect('/home');
}
