// Test file to verify module resolution
export const testImport = 'Test import works!';

// Test nodemailer import
import nodemailer from 'nodemailer';
console.log('Nodemailer imported successfully:', !!nodemailer);
