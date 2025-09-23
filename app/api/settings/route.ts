import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { settingsService } from '@/lib/services/settings';

interface SettingsUpdateBody {
  requireAdminApproval?: boolean;
  siteName?: string;
  maintenanceMode?: boolean;
  maxUsers?: number;
  sessionTimeout?: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const result = await settingsService.getSettings();
    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Failed to fetch settings' },
        { status: 500 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Type assertion for session user with role
    const user = session.user as { id: string; role?: string };
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json() as SettingsUpdateBody;
    const result = await settingsService.updateSettings(body, user.id);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error || 'Failed to update settings' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
