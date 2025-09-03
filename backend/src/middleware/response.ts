/* eslint-disable @typescript-eslint/no-namespace */
import { Response } from 'express';

type SuccessResponse = {
  success: true;
  message: string;
  data?: unknown;
};

type ErrorResponse = {
  success: false;
  message: string;
  statusCode: number;
};

declare global {
  namespace Express {
    interface Response {
      success: (message?: string, data?: unknown) => void;
      error: (message: string, statusCode?: number) => void;
      notFound: (message?: string) => void;
      unauthorized: (message?: string) => void;
      forbidden: (message?: string) => void;
      badRequest: (message?: string) => void;
      internalError: (message?: string) => void;
    }
  }
}

interface CustomResponse extends Response {
  success: (message?: string, data?: unknown) => void;
  error: (message: string, statusCode?: number) => void;
  notFound: (message?: string) => void;
  unauthorized: (message?: string) => void;
  forbidden: (message?: string) => void;
  badRequest: (message?: string) => void;
  internalError: (message?: string) => void;
}

type RequestHandler = (_req: unknown, res: Response, next: () => void) => void;

const extendResponse: RequestHandler = (_req, res, next) => {
  const customRes = res as unknown as CustomResponse;

  // Add success method
  customRes.success = function(message = 'Success', data?: unknown): void {
    const response: SuccessResponse = {
      success: true,
      message
    };
    
    if (data !== undefined) {
      response.data = data;
    }
  };

  // Add error method
  customRes.error = function(message: string, statusCode = 400): void {
    if (!message) {
      throw new Error('Error message is required');
    }
    
    const errorResponse: ErrorResponse = {
      success: false,
      message,
      statusCode
    };
  };

  // Add helper methods
  customRes.notFound = function(message = 'Resource not found'): void {
    this.error(message, 404);
  };

  customRes.unauthorized = function(message = 'Unauthorized'): void {
    this.error(message, 401);
  };

  customRes.forbidden = function(message = 'Forbidden'): void {
    this.error(message, 403);
  };

  customRes.badRequest = function(message = 'Bad Request'): void {
    this.error(message, 400);
  };

  customRes.internalError = function(message = 'Internal Server Error'): void {
    this.error(message, 500);
  };

  next();
};

export default extendResponse;