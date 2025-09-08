import { Request, Response } from 'express';
import type { NextFunction } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Response {
    success: <T = unknown>(data: T, message?: string) => Response;
    error: (message: string, errors?: unknown) => Response;
    notFound: (message?: string) => Response;
    unauthorized: (message?: string) => Response;
    forbidden: (message?: string) => Response;
    badRequest: (message?: string, errors?: unknown) => Response;
    internalError: (message?: string, errors?: unknown) => Response;
  }
}

type ResponseWithMethods = Response & {
  success: <T = unknown>(data: T, message?: string) => ResponseWithMethods;
  error: (message: string, errors?: unknown) => ResponseWithMethods;
  notFound: (message?: string) => ResponseWithMethods;
  unauthorized: (message?: string) => ResponseWithMethods;
  forbidden: (message?: string) => ResponseWithMethods;
  badRequest: (message?: string, errors?: unknown) => ResponseWithMethods;
  internalError: (message?: string, errors?: unknown) => ResponseWithMethods;
  status: (code: number) => ResponseWithMethods;
  json: (body: unknown) => ResponseWithMethods;
  locals: {
    statusCode?: number;
  };
};

// Custom response interfaces
export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: unknown;
}

const extendResponse = (_req: Request, res: Response, next: NextFunction): void => {
  const response = res as unknown as ResponseWithMethods;
  
  // Initialize locals if not exists
  response.locals = response.locals || {};
  // Add success method
  response.success = function<T = unknown>(this: ResponseWithMethods, data: T, message = 'Success'): ResponseWithMethods {
    const resp: SuccessResponse<T> = {
      success: true,
      message,
      data
    };
    
    return this.status(200).json(resp);
  };

  // Add error method
  response.error = function(this: ResponseWithMethods, message: string, errors?: unknown): ResponseWithMethods {
    if (!message) {
      throw new Error('Error message is required');
    }
    
    // Get status code from the response, default to 400 if not set
    const statusCode = this.locals.statusCode || 400;
    const resp: ErrorResponse = {
      success: false,
      message,
      statusCode
    };
    
    if (errors) {
      resp.errors = errors;
    }
    
    return this.status(statusCode).json(resp);
  };

  // Helper methods for common HTTP errors
  response.notFound = function(this: ResponseWithMethods, message = 'Resource not found'): ResponseWithMethods {
    this.locals.statusCode = 404;
    return this.error(message);
  };

  response.unauthorized = function(this: ResponseWithMethods, message = 'Unauthorized'): ResponseWithMethods {
    this.locals.statusCode = 401;
    return this.error(message);
  };

  response.forbidden = function(this: ResponseWithMethods, message = 'Forbidden'): ResponseWithMethods {
    this.locals.statusCode = 403;
    return this.error(message);
  };

  response.badRequest = function(this: ResponseWithMethods, message = 'Bad request', errors?: unknown): ResponseWithMethods {
    this.locals.statusCode = 400;
    return this.error(message, errors);
  };

  response.internalError = function(this: ResponseWithMethods, message = 'Internal server error', errors?: unknown): ResponseWithMethods {
    this.locals.statusCode = 500;
    return this.error(message, errors);
  };

  next();
};

export default extendResponse;