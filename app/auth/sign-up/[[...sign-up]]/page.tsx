import { SignUp } from "@clerk/nextjs";

// Generate static params for this route
export async function generateStaticParams() {
  // TODO: Replace with actual dynamic segments
  return [
    { /* Add your dynamic params here */ }
  ];
}


export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Get started with your free account today
          </p>
        </div>
        <SignUp
          path="/auth/sign-up"
          routing="path"
          signInUrl="/auth/sign-in"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
