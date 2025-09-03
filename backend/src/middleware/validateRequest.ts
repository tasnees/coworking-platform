import { validationResult } from 'express-validator';
import type { ValidationChain } from 'express-validator';
import { logger } from '../utils/logger';

// Simple type definitions to avoid TypeScript namespace issues
type ExpressRequest = {
  method: string;
  url: string;
  originalUrl?: string;
  body: unknown;
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  [key: string]: unknown;
};

type ExpressResponse = {
  status: (code: number) => ExpressResponse;
  json: (data: unknown) => void;
  [key: string]: unknown;
};

type ExpressNextFunction = (err?: Error) => void;
type ExpressRequestHandler = (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => void;

interface FieldError {
  field: string;
  message: string;
}

type ErrorType = {
  param?: string;
  msg?: string;
  nestedErrors?: ErrorType[];
};

/**
 * Middleware to validate request using express-validator
 * @param validations Array of validation chains
 * @returns Middleware function
 */
const validateRequest = (validations: ValidationChain[]): ExpressRequestHandler => {
  return async (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction): Promise<void> => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const extractedErrors: FieldError[] = [];
    const errorArray = errors.array({ onlyFirstError: false }) as ErrorType[];
    
    const processError = (error: ErrorType): void => {
      if (!error) return;
      
      const param = typeof error.param === 'string' ? error.param : 'unknown';
      const msg = typeof error.msg === 'string' ? error.msg : 'Validation error';
      
      if (!extractedErrors.some(e => e.field === param)) {
        extractedErrors.push({
          field: param,
          message: msg
        });
      }
      
      // Process nested errors
      if (Array.isArray(error.nestedErrors)) {
        error.nestedErrors.forEach(processError);
      }
    };
    
    errorArray.forEach(processError);

    logger.warn('Validation failed:', { 
      path: req.originalUrl || req.url,
      method: req.method,
      errors: extractedErrors
    });
    
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: extractedErrors
    });
  };
};

/**
 * Middleware to handle async/await errors in route handlers
 * @param fn The async route handler function
 * @returns A function that handles async errors
 */
type AsyncRequestHandler = (
  req: ExpressRequest,
  res: ExpressResponse,
  next: ExpressNextFunction
) => Promise<unknown>;

const asyncHandler = (fn: AsyncRequestHandler): ExpressRequestHandler => {
  return (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Export as named exports
export { validateRequest, asyncHandler };

export type { AsyncRequestHandler };

// Also export as default
const exported = {
  validateRequest,
  asyncHandler
};

export default exported;
