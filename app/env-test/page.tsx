'use client';

import { useEffect, useState } from 'react';

export default function EnvTest() {
  const [env, setEnv] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Get all environment variables that start with NEXT_PUBLIC_
      const publicEnv = Object.entries(process.env)
        .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
        .reduce((acc, [key, value]) => ({
          ...acc,
          [key]: value || 'not set',
        }), {});

      setEnv(publicEnv);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="p-4">Loading environment variables...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Environment Variables</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Public Environment Variables
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            These variables are exposed to the browser
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {Object.entries(env).map(([key, value]) => (
              <div key={key} className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">{key}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') 
                    ? '***' 
                    : value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
