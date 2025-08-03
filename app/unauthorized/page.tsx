import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">403 - Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
        </div>
        
        <div className="mt-6 flex flex-col space-y-3">
          <Link href="/dashboard">
            <Button className="w-full">
              Return to Dashboard
            </Button>
          </Link>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <Link href="/api/auth/signout">
            <Button variant="outline" className="w-full">
              Sign Out
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
