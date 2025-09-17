import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Add polyfills for older browsers */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Polyfill for process
              window.process = window.process || {};
              window.process.env = window.process.env || {};
              window.process.browser = true;
              window.process.version = '';
              window.process.versions = { node: false };
              
              // Polyfill for Buffer
              if (typeof window.Buffer === 'undefined') {
                window.Buffer = require('buffer/').Buffer;
              }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
