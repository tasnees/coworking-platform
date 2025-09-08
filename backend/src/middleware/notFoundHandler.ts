import { ApiError } from '../utils/ApiError';

// Create a custom request interface that extends Express Request
interface CustomRequest extends Express.Request {
  path: string;
  originalUrl: string;
  method: string;
}

type NotFoundHandler = (req: CustomRequest) => never;

/**
 * Not found handler middleware
 * @param req - Express request object
 */
const notFoundHandler: NotFoundHandler = (req) => {
  const errorDetails = {
    method: req.method,
    path: req.path,
    originalUrl: req.originalUrl
  };

  // Throw a 404 error that will be caught by the error handler
  const error = new ApiError(404, `The requested resource ${req.path} was not found.`);
  // Add details to the error object
  Object.assign(error, { details: errorDetails });
  throw error;
};

export { notFoundHandler };
