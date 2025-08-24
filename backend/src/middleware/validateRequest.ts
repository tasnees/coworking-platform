import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';
import { logger } from '../utils/logger';

interface FieldError {
  field: string;
  message: string;
}

/**
 * Middleware to validate request using express-validator
 * @param validations Array of validation chains
 * @returns Middleware function
 */
const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const extractedErrors: FieldError[] = [];
    const errorArray = errors.array({ onlyFirstError: false });
    
    for (const err of errorArray) {
      // Type guard for standard validation errors
      if (err && typeof err === 'object' && 'param' in err) {
        const param = typeof (err as any).param === 'string' ? (err as any).param : 'unknown';
        const msg = typeof (err as any).msg === 'string' ? (err as any).msg : 'Validation error';
        
        if (!extractedErrors.some(e => e.field === param)) {
          extractedErrors.push({
            field: param,
            message: msg
          });
        }
      }
      
      // Handle nested errors if they exist
      if ('nestedErrors' in err && Array.isArray((err as any).nestedErrors)) {
        const nestedErrors = (err as any).nestedErrors || [];
        
        for (const nestedErr of nestedErrors) {
          if (nestedErr && typeof nestedErr === 'object' && 'param' in nestedErr) {
            const nestedParam = nestedErr.param || 'unknown';
            const nestedMsg = nestedErr.msg || 'Validation error';
            
            if (!extractedErrors.some(e => e.field === nestedParam)) {
              extractedErrors.push({
                field: nestedParam,
                message: nestedMsg
              });
            }
          }
        }
      }
    }

    logger.warn('Validation failed:', { 
      path: req.path,
      method: req.method,
      errors: extractedErrors 
    });
    
    return res.status(400).json({
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
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Export as named exports
export { validateRequest, asyncHandler };

// Also export as default
const exported = {
  validateRequest,
  asyncHandler
};

export default exported;
