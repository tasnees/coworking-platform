import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { hash } from 'bcryptjs';

interface StaffMemberCreateRequest {
  name: string;
  email: string;
  phone?: string;
  membershipType: string;
  notes?: string;
}

interface StaffMemberResponse {
  id: string;
  name: string;
  email: string;
  membershipType: string;
  status: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  message: string;
}

interface StaffMembersListResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  membershipType: "basic" | "premium" | "enterprise";
  status: "active" | "inactive" | "suspended";
  company: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  lastVisit?: string;
  totalVisits: number;
  profileImage?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is staff or admin
    if (!session?.user?.role || !['admin', 'staff'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch all members (non-admin users) from the database
    const users = await prisma.user.findMany({
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
        phone: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
        image: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the database users to match the expected interface
    const members: StaffMembersListResponse[] = users.map((user) => {
      const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
      const lastLogin = user.lastLogin ? (user.lastLogin instanceof Date ? user.lastLogin : new Date(user.lastLogin)) : null;

      return {
        id: user.id,
        name: user.name || 'No Name',
        email: user.email || 'No Email',
        phone: user.phone || '',
        joinDate: createdAt.toISOString().split('T')[0],
        membershipType: (user.membershipType as "basic" | "premium" | "enterprise") || 'basic',
        status: (user.status as "active" | "inactive" | "suspended") || 'active',
        company: '', // Not in database - using empty string as default
        address: '', // Not in database - using empty string as default
        city: '', // Not in database - using empty string as default
        country: '', // Not in database - using empty string as default
        notes: user.notes || '',
        lastVisit: lastLogin?.toISOString(),
        totalVisits: 0, // Not in database - using 0 as default
        profileImage: user.image || undefined
      };
    });

    return NextResponse.json(members);

  } catch (error) {
    console.error('Error fetching members for staff:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is staff or admin
    if (!session?.user?.role || !['admin', 'staff'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data: StaffMemberCreateRequest = await request.json();
    const {
      name,
      email,
      phone = '',
      membershipType = 'flex',
      notes = ''
    } = data;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a temporary password for pending users
    const tempPassword = randomBytes(16).toString('hex');

    // Hash the temporary password
    const hashedPassword = await hash(tempPassword, 10);

    // Create the new member with pending status
    const newMember = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'member',
        status: 'pending', // Staff-created members start as pending
        membershipType: membershipType,
        ...(phone ? { phone } : {}),
        ...(notes ? { notes } : {}),
        emailVerified: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        membershipType: true,
        phone: true,
        notes: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Prepare response
    const responseData: StaffMemberResponse = {
      id: newMember.id,
      name: newMember.name || 'No Name',
      email: newMember.email || 'No Email',
      membershipType: newMember.membershipType || 'flex',
      status: newMember.status || 'pending',
      phone: newMember.phone || undefined,
      notes: newMember.notes || undefined,
      createdAt: newMember.createdAt.toISOString(),
      message: 'Member created successfully with pending status. Admin approval required.'
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('Error creating pending member:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
