import nodemailer from 'nodemailer';

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

const emailConfig = {
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: process.env.EMAIL_SERVER_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_SERVER_USER || '',
    pass: process.env.EMAIL_SERVER_PASSWORD || '',
  },
};

// Validate required email configuration
if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
  console.warn('Email configuration is incomplete. Email sending will be disabled.');
  console.warn('Please set EMAIL_SERVER_HOST, EMAIL_SERVER_USER, and EMAIL_SERVER_PASSWORD environment variables.');
}

const transporter = emailConfig.host && emailConfig.auth.user && emailConfig.auth.pass
  ? nodemailer.createTransport(emailConfig)
  : {
      sendMail: async (mailOptions: any) => {
        console.warn('Email service not configured. Email not sent:', mailOptions);
        return { messageId: 'dummy-message-id' };
      },
    };

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@coworking-platform.com',
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const subject = 'Reset your password';
  const html = `
    <div>
      <h2>Reset Your Password</h2>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p>
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 500;
        ">
          Reset Password
        </a>
      </p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
  });
}
