import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import AdminDashboard from './page';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/dashboard/admin');
  }
  
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  return <AdminDashboard user={session.user} />;
}
