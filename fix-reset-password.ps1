$content = @'
// app/auth/reset-password/[token]/page.tsx
'use client';

import dynamic from 'next/dynamic';

// Dynamically import the client component with SSR disabled
const ResetPasswordForm = dynamic(
  () => import('./reset-password-form'),
  { ssr: false }
);

// This function is required for static exports
export function generateStaticParams() {
  // Return an empty array since this is a dynamic route
  return [];
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
'@

$content | Out-File -FilePath "app\auth\reset-password\[token]\page.tsx" -Encoding utf8 -Force
