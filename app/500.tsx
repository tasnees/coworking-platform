import Link from 'next/link';
export default function Custom500() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-6xl font-bold">500</h1>
        <p className="text-xl mt-2">Server-side error occurred</p>
        <Link 
          href="/" 
          className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
