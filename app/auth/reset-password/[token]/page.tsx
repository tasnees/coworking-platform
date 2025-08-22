import ResetPasswordWrapper from './reset-password-wrapper';

// This function is required for static exports
export function generateStaticParams() {
  // Return an empty array since we don't know the tokens in advance
  // The actual token will be handled client-side
  return [];
}

export default function ResetPasswordPage() {
  return <ResetPasswordWrapper />;
}