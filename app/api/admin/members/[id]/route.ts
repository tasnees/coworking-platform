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
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { status, membershipType } = await request.json();

    // Validate status if provided
    if (status && !['active', 'suspended', 'cancelled'].includes(status)) {
      return new NextResponse('Invalid status', { status: 400 });
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      // If status is cancelled, also update membership end date
      if (status === 'cancelled') {
        updateData.membershipEndDate = new Date();
      }
    }
    
    if (membershipType) {
      updateData.membershipType = membershipType;
    }

    // Update member data
    const updatedMember = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Delete the member
    await prisma.user.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting member:', error);
    
    // Handle case where member is not found
    if ((error as any).code === 'P2025') {
      return new NextResponse('Member not found', { status: 404 });
    }
    
    return new NextResponse('Internal Error', { status: 500 });
  }
}
