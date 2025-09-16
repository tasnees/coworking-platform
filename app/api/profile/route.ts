import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// For static exports, we need to handle the case where server-side auth isn't available
const isStaticExport = process.env.NEXT_PHASE === 'phase-export' || 
                      process.env.NODE_ENV === 'production';

// Static configuration for compatibility with static exports
// Dynamic behavior is automatically handled by Next.js in production
export const dynamic = process.env.NODE_ENV === "production" ? "auto" : "force-dynamic";
export const dynamicParams = true;
export const revalidate = false;

export async function GET() {
  if (isStaticExport) {
    return NextResponse.json(
      { 
        error: 'Not available in static export',
        message: 'Profile data is not available in static export mode. Please use server-side rendering for full functionality.'
      },
      { status: 501 } // Not Implemented
    );
  }

  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: session.user,
      expires: session.expires
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
