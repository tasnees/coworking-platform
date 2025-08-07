import React from 'react';
import Link from 'next/link';

function Error({ statusCode }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-red-500">{statusCode || 500}</h1>
        <h2 className="text-2xl font-semibold mt-4">
          {statusCode === 404 ? 'Page Not Found' : 'Something went wrong'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {statusCode === 404
            ? "The page you're looking for doesn't exist or has been moved."
            : 'We\'re experiencing technical difficulties. Please try again later.'}
        </p>
        <div className="mt-6">
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
