import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getDashboardPath } from '@/lib/utils/routes';

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user) {
    const role = (session.user.role?.toLowerCase() as 'admin' | 'staff' | 'member') || 'member';
    redirect(getDashboardPath(role));
  }
  
  redirect('/home');
}
