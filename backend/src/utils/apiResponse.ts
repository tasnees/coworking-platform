/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express-serve-static-core';

type ErrorResponse = Record<string, unknown> | null;

type ExpressResponse = Response;

export class ApiResponse {
  static success<T = unknown>(
    res: ExpressResponse,
    data: T,
    message = 'Success',
    status = 200
  ): ExpressResponse {
    return res.status(status).json({
      status,
      message,
      data
    });
  }

  static error(
    res: ExpressResponse,
    message: string,
    status = 500,
    errors: ErrorResponse = null
  ): ExpressResponse {
    return res.status(status).json({
      status,
      message,
      errors
    });
  }

  static sendResponse<T>(
    res: ExpressResponse,
    data: T,
    statusCode = 200,
    message = 'Success'
  ): ExpressResponse {
    const response = {
      status: statusCode,
      message,
      data,
      success: statusCode >= 200 && statusCode < 300
    };

    return res.status(statusCode).json(response);
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  static unauthorized(res: Response, message = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  static badRequest(
    res: Response, 
    message = 'Bad Request', 
    errors?: ErrorResponse
  ): Response {
    return this.error(res, message, 400, errors);
  }

  static internalError(
    res: Response, 
    message = 'Internal Server Error'
  ): ExpressResponse {
    return this.error(res, message, 500);
  }
}

export function sendResponse<T = unknown>(
  res: ExpressResponse,
  data: T,
  statusCode = 200,
  message = 'Success'
): ExpressResponse {
  const isSuccess = statusCode >= 200 && statusCode < 300;
  return res.status(statusCode).json({
    success: isSuccess,
    message,
    data
  });
}
