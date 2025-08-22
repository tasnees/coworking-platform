declare module 'nodemailer' {
  export interface Transporter {
    sendMail(mailOptions: any, callback: (error: Error | null, info: any) => void): void;
    sendMail(mailOptions: any): Promise<any>;
  }
  
  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }
  
  export function createTransport(options: TransportOptions): Transporter;
}
