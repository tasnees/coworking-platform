import { Response as ExpressResponse } from 'express';

declare module 'express' {
  interface Response {
    success: <T = unknown>(data: T, message?: string, status?: number) => ExpressResponse;
    error: (message: string, status?: number, errors?: unknown) => ExpressResponse;
    notFound: (message?: string) => ExpressResponse;
    unauthorized: (message?: string) => ExpressResponse;
    forbidden: (message?: string) => ExpressResponse;
    badRequest: (message?: string, errors?: unknown) => ExpressResponse;
    internalError: (message?: string, errors?: unknown) => ExpressResponse;
  }
}

export {};
