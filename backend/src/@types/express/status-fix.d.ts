import 'express-serve-static-core';

// Restore the Response.status method call-signature.
// Some other declaration merged a `status` property (Number) and hid the method,
// causing TS2349 "Number has no call signatures" everywhere.

declare module 'express-serve-static-core' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Response {
    /**
     * Sets the HTTP status for the response. Chainable.
     */
    status(code: number): this;
  }
}
