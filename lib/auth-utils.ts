import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { UserRole } from './auth-types';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function requireAuth(requiredRole?: UserRole) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { user: null, redirect: { destination: '/auth/login', permanent: false } };
  }

  if (requiredRole && user.role !== requiredRole) {
    return { user: null, redirect: { destination: '/unauthorized', permanent: false } };
  }

  return { user, redirect: null };
}
