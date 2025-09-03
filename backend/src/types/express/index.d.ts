import { IUserDocument } from '../../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument & { id: string; role: string; [key: string]: unknown };
      token?: string;
      cookies?: {
        refreshToken?: string;
        [key: string]: string | undefined;
      };
      headers: {
        [key: string]: string | string[] | undefined;
        'authorization'?: string;
        'Authorization'?: string;
      };
    }

    interface Response {
      status: (code: number) => Response;
      json: (body: any) => Response;
      success: <T = unknown>(data: T, message?: string, status?: number) => Response;
      error: (message: string, status?: number, errors?: unknown) => Response;
      notFound: (message?: string) => Response;
      unauthorized: (message?: string) => Response;
      forbidden: (message?: string) => Response;
      badRequest: (message?: string, errors?: unknown) => Response;
      internalError: (message?: string, errors?: unknown) => Response;
    }
  }
}

// Export the Request interface for use in other files
export interface AuthenticatedRequest extends Express.Request {
  user: NonNullable<Express.Request['user']>;
  token: string;
}

export {};
