import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { UserRole } from './auth-types';

export async function getCurrentUser() {
  if (typeof window !== 'undefined') {
    throw new Error('getCurrentUser should only be called on the server side');
  }
  
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function requireRole(role: UserRole) {
  if (typeof window !== 'undefined') {
    throw new Error('requireRole should only be called on the server side');
  }
  
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Not authenticated');
  }
  
  if (session.user.role !== role) {
    throw new Error(`Requires ${role} role`);
  }
  
  return session.user;
}

export async function requireAdmin() {
  return requireRole('ADMIN');
}

export async function requireMember() {
  return requireRole('MEMBER');
}
