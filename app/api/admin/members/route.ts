import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { hash } from 'bcryptjs';
import { User } from '@prisma/client';

interface MemberResponse {
  id: string;
  name: string | null;
  email: string | null;
  membership: string;
  status: string;
  membershipType: string;
  joinDate: string;
  lastVisit: string | null;
  plan: string;
  phone: string | null;
  notes: string | null;
  membershipEndDate: string | null;
}

interface UserWithMembership {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  role: string;
  status: string;
  membershipType: string | null;
  phone: string | null;
  notes: string | null;
  lastLogin: Date | null;
  membershipEndDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

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
        updatedAt: true,
        image: true,
        phone: true,
        notes: true,
        membershipEndDate: true
      },
      orderBy: {
        email: 'desc'  // Changed from createdAt to email as a workaround
      }
    });

    // Transform the data to match the frontend's expected format
    const formattedMembers = members.map((member): MemberResponse => {
      const createdAt = member.createdAt instanceof Date ? member.createdAt : new Date(member.createdAt);
      const lastLogin = member.lastLogin ? (member.lastLogin instanceof Date ? member.lastLogin : new Date(member.lastLogin)) : null;
      const membershipEndDate = member.membershipEndDate ? (member.membershipEndDate instanceof Date ? member.membershipEndDate : new Date(member.membershipEndDate)) : null;
      
      return {
        id: member.id,
        name: member.name || 'No Name',
        email: member.email || 'No Email',
        membership: member.status,
        status: member.status,
        membershipType: member.membershipType || 'flex',
        joinDate: createdAt.toISOString(),
        lastVisit: lastLogin?.toISOString() || null,
        plan: member.membershipType || 'flex',
        phone: member.phone,
        notes: member.notes,
        membershipEndDate: membershipEndDate?.toISOString() || null
      };
    });

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error('Error fetching members:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { 
      name, 
      email, 
      password,
      role = 'member',
      phone = '', 
      membershipType = 'flex', 
      status = 'active',
      notes = ''
    } = data;

    // Validate role
    if (!['member', 'staff'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be either "member" or "staff"' },
        { status: 400 }
      );
    }

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

    // Hash the password if provided, otherwise generate a random one
    const hashedPassword = password 
      ? await hash(password, 10) // Hash the provided password
      : randomBytes(16).toString('hex'); // Generate a random password if not provided

    // Create the new member
    const newMember = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role,
        status: 'active',
        // Using type assertion to bypass TypeScript errors for now
        // These fields should be properly added to the Prisma schema
        ...(phone ? { phone } : {}) as any,
        ...(notes ? { notes } : {}) as any,
        membershipType: role === 'member' ? 'flex' : null,
        emailVerified: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        // Using type assertion for fields not in the base User type
        ...({} as {
          membershipType: true,
          phone: true,
          notes: true,
          membershipEndDate: true
        }),
        createdAt: true,
        updatedAt: true
      }
    });

    // TODO: Send welcome email with password reset link

    // Create a response object that matches the frontend's expected format
    const newMemberWithType = newMember as UserWithMembership;
    const createdAt = newMemberWithType.createdAt instanceof Date ? newMemberWithType.createdAt : new Date(newMemberWithType.createdAt);
    const lastLogin = newMemberWithType.lastLogin ? (newMemberWithType.lastLogin instanceof Date ? newMemberWithType.lastLogin : new Date(newMemberWithType.lastLogin)) : null;
    const membershipEndDate = newMemberWithType.membershipEndDate ? (newMemberWithType.membershipEndDate instanceof Date ? newMemberWithType.membershipEndDate : new Date(newMemberWithType.membershipEndDate)) : null;

    const responseData: MemberResponse = {
      id: newMemberWithType.id,
      name: newMemberWithType.name || 'No Name',
      email: newMemberWithType.email || 'No Email',
      membership: newMemberWithType.status || 'active',
      status: newMemberWithType.status || 'active',
      membershipType: newMemberWithType.membershipType || 'flex',
      phone: newMemberWithType.phone || null,
      notes: newMemberWithType.notes || null,
      joinDate: createdAt.toISOString(),
      lastVisit: lastLogin?.toISOString() || null,
      plan: newMemberWithType.membershipType || 'flex',
      membershipEndDate: membershipEndDate?.toISOString() || null
    };

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('Error creating member:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
