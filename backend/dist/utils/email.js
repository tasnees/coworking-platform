"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logger_1 = require("./logger");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const util_1 = require("util");
const readFile = (0, util_1.promisify)(fs_1.default.readFile);
// Email template path
const TEMPLATES_DIR = path_1.default.join(__dirname, '../../email-templates');
// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    // Disable TLS when not using secure connection
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
});
// Verify connection configuration
transporter.verify((error) => {
    if (error) {
        logger_1.logger.error('SMTP connection error:', error);
    }
    else {
        logger_1.logger.info('SMTP server is ready to take our messages');
    }
});
// Compile email template
const compileTemplate = (templateName, context) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templatePath = path_1.default.join(TEMPLATES_DIR, `${templateName}.hbs`);
        const source = yield readFile(templatePath, 'utf8');
        const template = handlebars_1.default.compile(source);
        return template(context);
    }
    catch (error) {
        logger_1.logger.error(`Error compiling email template ${templateName}:`, error);
        throw new Error(`Failed to compile email template: ${templateName}`);
    }
});
// Send email with template
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, subject, template, context, attachments = [] } = options;
    try {
        // Add common context variables
        const emailContext = Object.assign(Object.assign({}, context), { appName: process.env.APP_NAME || 'Coworking Platform', appUrl: process.env.CLIENT_URL || 'http://localhost:3000', year: new Date().getFullYear() });
        // Compile HTML from template
        const html = yield compileTemplate(template, emailContext);
        // Setup email data
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME || 'Coworking Platform'}" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@coworking.com'}>`,
            to,
            subject,
            html,
            attachments,
        };
        // Send email
        const info = yield transporter.sendMail(mailOptions);
        logger_1.logger.info(`Email sent to ${to} with message ID: ${info.messageId}`);
    }
    catch (error) {
        logger_1.logger.error('Error sending email:', error);
        throw error; // Re-throw to be handled by the caller
    }
});
exports.sendEmail = sendEmail;
// Send test email
const sendTestEmail = (to) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, exports.sendEmail)({
            to,
            subject: 'Test Email',
            template: 'test-email',
            context: {
                name: 'Test User',
                message: 'This is a test email from Coworking Platform.',
            },
        });
        return { success: true, message: 'Test email sent successfully.' };
    }
    catch (error) {
        logger_1.logger.error('Error sending test email:', error);
        return { success: false, message: 'Failed to send test email.' };
    }
});
exports.sendTestEmail = sendTestEmail;
