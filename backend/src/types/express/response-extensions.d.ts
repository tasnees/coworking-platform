import { Response } from 'express';

declare module 'express-serve-static-core' {
  interface Response {
    success: <T = unknown>(data: T, message?: string, status?: number) => Response;
    error: (message: string, status?: number, errors?: unknown) => Response;
    notFound: (message?: string) => Response;
    unauthorized: (message?: string) => Response;
    forbidden: (message?: string) => Response;
    badRequest: (message?: string, errors?: unknown) => Response;
    internalError: (message?: string, errors?: unknown) => Response;
  }
}
