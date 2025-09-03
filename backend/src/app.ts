import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { apiLimiter } from './middleware/rateLimit';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { workspaceRoutes } from './routes/workspace.routes';
import bookingRoutes from './routes/booking.routes';

const app = express();

// Trust first proxy (for production)
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));

// Rate limiting
app.use(apiLimiter);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/health', () => 'Server is running');

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
