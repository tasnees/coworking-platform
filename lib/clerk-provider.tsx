'use client';

import { ClerkProvider as ClerkProviderBase } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';
import { ReactNode, useEffect, useState } from 'react';

export function ClerkProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by waiting for the client to mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ClerkProviderBase
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#3b82f6',
          colorBackground: resolvedTheme === 'dark' ? '#0f172a' : '#ffffff',
          colorText: resolvedTheme === 'dark' ? '#f8fafc' : '#1e293b',
          colorInputBackground: resolvedTheme === 'dark' ? '#1e293b' : '#f1f5f9',
          colorInputText: resolvedTheme === 'dark' ? '#f8fafc' : '#1e293b',
        },
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
          footerActionLink: 'text-primary hover:text-primary/80',
          card: 'bg-background text-foreground',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton: 'border-border hover:bg-accent',
          dividerLine: 'bg-border',
          dividerText: 'text-muted-foreground',
          formFieldLabel: 'text-foreground',
          formFieldInput: 'border-border bg-background text-foreground',
          formFieldWarningText: 'text-yellow-600',
          formFieldErrorText: 'text-red-600',
          footerActionText: 'text-muted-foreground',
        },
      }}
      signInUrl="/auth/sign-in"
      signUpUrl="/auth/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard/onboarding"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProviderBase>
  );
}
