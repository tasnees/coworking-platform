import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resources = await prisma.resource.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Failed to fetch resources', error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.type || !data.capacity || data.hourlyRate === undefined) {
      return new NextResponse(
        JSON.stringify({ message: 'Name, type, capacity, and hourly rate are required' }),
        { status: 400 }
      );
    }

    const resourceData: any = {
      name: data.name,
      type: data.type,
      capacity: parseInt(data.capacity, 10),
      hourlyRate: parseFloat(data.hourlyRate),
      description: data.description || null,
    };

    // Only include isActive if it's provided
    if (data.isActive !== undefined) {
      resourceData.isActive = Boolean(data.isActive);
    }

    const resource = await prisma.resource.create({
      data: resourceData,
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Failed to create resource', error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    );
  }
}
