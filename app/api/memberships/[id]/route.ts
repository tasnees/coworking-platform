import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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

    const { id } = params;
    
    // Validate ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid membership plan ID' },
        { status: 400 }
      );
    }

    // Get the current plan to toggle its status
    const currentPlan = await prisma.membershipPlan.findUnique({
      where: { id }
    });

    if (!currentPlan) {
      return NextResponse.json(
        { message: 'Membership plan not found' },
        { status: 404 }
      );
    }

    // Toggle the active status
    const updatedPlan = await prisma.membershipPlan.update({
      where: { id },
      data: {
        active: !currentPlan.active
      }
    });

    return NextResponse.json({
      ...updatedPlan,
      id: updatedPlan.id.toString()
    });
    
  } catch (error) {
    console.error('Error toggling membership plan status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Add other HTTP methods if needed
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    
    // Validate ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid membership plan ID' },
        { status: 400 }
      );
    }

    const plan = await prisma.membershipPlan.findUnique({
      where: { id }
    });

    if (!plan) {
      return NextResponse.json(
        { message: 'Membership plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...plan,
      id: plan.id.toString()
    });
    
  } catch (error) {
    console.error('Error fetching membership plan:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
