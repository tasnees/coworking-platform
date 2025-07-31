import React from 'react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl mt-2">Page not found</p>
        <a 
          href="/" 
          className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
