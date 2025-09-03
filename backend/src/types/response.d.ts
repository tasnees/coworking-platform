import { Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';

declare global {
  namespace Express {
    interface Response {
      /**
       * Send a success response with data
       */
      success: <T = any>(data: T, message?: string, status?: number) => Response;
      
      /**
       * Send an error response
       */
      error: (message: string, status?: number, errors?: any) => Response;
      
      /**
       * Send a not found response
       */
      notFound: (message?: string) => Response;
      
      /**
       * Send an unauthorized response
       */
      unauthorized: (message?: string) => Response;
      
      /**
       * Send a forbidden response
       */
      forbidden: (message?: string) => Response;
      
      /**
       * Send a bad request response
       */
      badRequest: (message?: string, errors?: any) => Response;
      
      /**
       * Send an internal server error response
       */
      internalError: (message?: string) => Response;
    }
  }
}

// This adds our custom methods to the Express Response prototype
declare module 'express-serve-static-core' {
  interface Response {
    success: <T = any>(data: T, message?: string, status?: number) => Response;
    error: (message: string, status?: number, errors?: any) => Response;
    notFound: (message?: string) => Response;
    unauthorized: (message?: string) => Response;
    forbidden: (message?: string) => Response;
    badRequest: (message?: string, errors?: any) => Response;
    internalError: (message?: string) => Response;
  }
}
