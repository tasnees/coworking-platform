import ForgotPasswordForm from './forgot-password-form';

// Generate static params for this route
export function generateStaticParams() {
  // For static export, return an empty array since we don't know the params in advance
  // The actual params will be handled client-side
  return [];
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
