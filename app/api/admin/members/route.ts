import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch all members (non-admin users)
    const members = await prisma.user.findMany({
      where: {
        role: {
          not: 'admin'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        membershipType: true,
        lastLogin: true,
        createdAt: true,
        image: true,
        phone: true,
        notes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the frontend's expected format
    const formattedMembers = members.map(member => ({
      id: member.id,
      name: member.name || 'No Name',
      email: member.email || 'No Email',
      membership: member.status || 'active',
      status: member.status || 'active',
      membershipType: member.membershipType || 'flex',
      joinDate: member.createdAt.toISOString(),
      lastVisit: member.lastLogin?.toISOString() || '',
      plan: member.membershipType || 'flex',
      phone: member.phone || '',
      notes: member.notes || ''
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error('Error fetching members:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
