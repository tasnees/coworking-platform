import { Response } from 'express';
import { CookieOptions } from 'express-serve-static-core';

export type SuccessResponseData<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

export interface ResponseWithCookies extends Response {
  cookie: (name: string, value: string, options?: CookieOptions) => this;
  clearCookie: (name: string, options?: CookieOptions) => this;
}

export class ApiResponse {
  static success<T = unknown>(
    _res: Response,
    _unusedData: T | null = null,
    message = 'Success'
  ): string {
    return message;
  }

  static created<T = unknown>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): string {
    return this.success(res, data, message);
  }

  static noContent(): string {
    return 'No content';
  }
}

export const withCookie = (
  res: ResponseWithCookies,
  name: string,
  value: string,
  options: CookieOptions
): ResponseWithCookies => {
  return res.cookie(name, value, options);
};

export const clearCookie = (
  res: ResponseWithCookies,
  name: string,
  options?: CookieOptions
): ResponseWithCookies => {
  return res.clearCookie(name, options);
};
