import { getServerSession } from 'next-auth';
import { compare, hash } from 'bcryptjs';
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

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await compare(password, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await hash(password, saltRounds);
}
