"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestEmail = exports.sendSimpleEmail = exports.sendEmail = exports.testConnection = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
// Simple logger fallback if you don't have one
const logger = {
    info: (msg, ...args) => console.log('[INFO]', msg, ...args),
    error: (msg, ...args) => console.error('[ERROR]', msg, ...args),
};
// Email template path
const TEMPLATES_DIR = path_1.default.resolve(process.cwd(), 'email-templates');
// SMTP Configuration
const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
        : undefined,
};
// Create transporter
const transporter = nodemailer_1.default.createTransport(smtpConfig);
// Optional: Test connection function (call manually if needed)
const testConnection = async () => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM_ADDRESS || 'test@example.com',
            to: process.env.EMAIL_FROM_ADDRESS || 'test@example.com',
            subject: 'Connection Test',
            html: '<p>Connection test</p>',
        });
        logger.info('SMTP server ready');
    }
    catch (error) {
        logger.error('SMTP connection failed:', error);
        throw error;
    }
};
exports.testConnection = testConnection;
// Simple template replacement (no Handlebars dependency)
const compileTemplate = (template, context) => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return context[key]?.toString() || match;
    });
};
// Email sending function
const sendEmail = async (options) => {
    const { to, subject, template, html, context = {}, attachments = [] } = options;
    let emailHtml = html;
    // If template is provided, try to load it
    if (template && !html) {
        try {
            const templatePath = path_1.default.join(TEMPLATES_DIR, `${template}.html`);
            const templateContent = await promises_1.default.readFile(templatePath, 'utf8');
            const emailContext = {
                ...context,
                appName: process.env.APP_NAME || 'Coworking Platform',
                appUrl: process.env.CLIENT_URL || 'http://localhost:3000',
                year: new Date().getFullYear(),
            };
            emailHtml = compileTemplate(templateContent, emailContext);
        }
        catch (error) {
            logger.error('Template loading failed:', error);
            throw new Error(`Failed to load email template: ${template}`);
        }
    }
    if (!emailHtml) {
        throw new Error('Either template or html must be provided');
    }
    const from = `"${process.env.EMAIL_FROM_NAME || 'Coworking Platform'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@coworking.com'}>`;
    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            html: emailHtml,
            attachments,
        });
        logger.info(`Email sent to ${to}`);
    }
    catch (error) {
        logger.error('Error sending email:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
// Send simple email without template
const sendSimpleEmail = async (to, subject, html) => {
    await (0, exports.sendEmail)({ to, subject, html });
};
exports.sendSimpleEmail = sendSimpleEmail;
// Test email function
const sendTestEmail = async (to) => {
    try {
        const testHtml = `
      <h1>Test Email</h1>
      <p>Hello Test User,</p>
      <p>This is a test email from Coworking Platform.</p>
      <p>Current time: ${new Date().toISOString()}</p>
    `;
        await (0, exports.sendSimpleEmail)(to, 'Test Email', testHtml);
        return { success: true, message: 'Test email sent successfully.' };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Test email failed:', errorMessage);
        return { success: false, message: `Failed to send test email: ${errorMessage}` };
    }
};
exports.sendTestEmail = sendTestEmail;
