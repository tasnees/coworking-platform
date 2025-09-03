import { Request, Response } from 'express';

type ExtendedRequest = Request & {
  originalUrl: string;
};

type ResponseWithStatus = {
  status: (code: number) => { 
    json: (data: { success: boolean; message: string }) => void; 
  };
};

export const notFound = (req: ExtendedRequest, res: Response): void => {
  const response = (res as unknown) as ResponseWithStatus;
  response.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

