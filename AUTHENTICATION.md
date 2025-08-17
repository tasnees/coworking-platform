# Authentication System Documentation

This document provides an overview of the authentication system implemented in the Coworking Platform.

## Features

- **Credentials-based authentication** using NextAuth.js with MongoDB
- User registration with email and password
- Secure password hashing with bcrypt
- Email verification (placeholder)
- Password reset flow
- Role-based access control (admin, staff, member)
- Session management with JWT
- Protected API routes

## Setup

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/coworking-platform
DATABASE_NAME=users

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Email (for production)
EMAIL_SERVER=smtp://user:pass@email-server:587
EMAIL_FROM=noreply@coworking.com
```

## Authentication Flow

### 1. Registration

1. User fills out the registration form with name, email, and password
2. Form is validated on the client and server
3. Password is hashed with bcrypt
4. New user is created in MongoDB with default 'member' role
5. User is redirected to login page

### 2. Login

1. User enters email and password
2. Credentials are verified against the database
3. If valid, a session is created and JWT token is issued
4. User is redirected to the dashboard

### 3. Password Reset

1. User requests a password reset with their email
2. A reset token is generated and stored in the database with an expiry time
3. Email with reset link is sent to the user (in production)
4. User clicks the link and is taken to the reset password page
5. After submitting a new password, the token is validated
6. If valid, the password is updated and the token is cleared

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/forgot-password` - Request a password reset
- `POST /api/auth/reset-password` - Reset password with a valid token

### NextAuth.js (automatic)

- `GET /api/auth/signin` - Login page
- `GET /api/auth/signout` - Logout
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token
- `GET /api/auth/providers` - List authentication providers
- `POST /api/auth/signin/credentials` - Handle credentials login
- `POST /api/auth/signout` - Handle logout
- `POST /api/auth/_log` - Logging endpoint

## Components

### `LogoutButton`

A reusable button component that handles user logout.

```tsx
import { LogoutButton } from '@/components/auth/LogoutButton';

// Usage
<LogoutButton />
```

## Pages

### Authentication Pages

- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Request password reset
- `/auth/reset-password/[token]` - Reset password with token

### Protected Pages

- `/dashboard` - User dashboard (protected)
- `/dashboard/profile` - User profile (protected)
- `/dashboard/admin/*` - Admin area (admin role required)
- `/dashboard/staff/*` - Staff area (staff/admin role required)

## Middleware

The application uses Next.js middleware to protect routes and handle authentication.

Protected routes are defined in `middleware.ts` and automatically redirect unauthenticated users to the login page.

## Security Considerations

- Passwords are never stored in plain text
- Password reset tokens are single-use and expire after 1 hour
- Session tokens are stored in HTTP-only cookies
- CSRF protection is enabled
- Rate limiting should be implemented in production
- Email verification should be implemented for production use

## Testing

To test the authentication flow locally:

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Visit http://localhost:3000/auth/register to create a new account
3. Log in with your credentials at http://localhost:3000/auth/login
4. Test the password reset flow

## Production Deployment

For production deployment, make sure to:

1. Set up a production MongoDB database
2. Configure a proper email service (e.g., SendGrid, Postmark)
3. Set secure, unique values for all environment variables
4. Enable HTTPS
5. Implement rate limiting
6. Set up monitoring and logging
7. Regularly update dependencies
