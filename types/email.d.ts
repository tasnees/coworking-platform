declare module '@/lib/email' {
  export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
  }

  export function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void>;
  export function sendEmail(options: SendEmailOptions): Promise<{
    messageId: string;
    [key: string]: any;
  }>;
}
