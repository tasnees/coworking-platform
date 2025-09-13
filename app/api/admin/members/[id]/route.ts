import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

type Status = 'active' | 'suspended' | 'cancelled';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { status } = await request.json();

    // Validate status
    if (!['active', 'suspended', 'cancelled'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }

    // Update member status
    const updatedMember = await prisma.user.update({
      where: { id: params.id },
      data: { 
        status,
        // If status is cancelled, also update membership end date
        ...(status === 'cancelled' && { membershipEndDate: new Date() })
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        role: true,
        emailVerified: true,
        image: true,
        membershipEndDate: true
      }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating member status:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
