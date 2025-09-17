import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();

  // Apply polyfills on client-side only
  useEffect(() => {
    // Load polyfills for older browsers
    if (typeof window !== 'undefined') {
      // Ensure Buffer is available
      if (typeof window.Buffer === 'undefined') {
        window.Buffer = require('buffer/').Buffer;
      }
      
      // Ensure process is available
      window.process = window.process || {};
      window.process.env = window.process.env || {};
      window.process.browser = true;
    }
  }, []);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Component {...pageProps} />
            <Toaster position="top-right" />
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
