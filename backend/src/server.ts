import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './modules/auth/routes/auth.routes';
import examRoutes from './routes/examRoutes';
import studentRoutes from './routes/studentRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { TokenCleanupService } from './modules/auth/services/token-cleanup.service';

const app = express();
const PORT = process.env['PORT'] || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true, // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware (for JWT tokens)
app.use(cookieParser(process.env['COOKIE_SECRET']));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/exam', examRoutes);
app.use('/api/student', studentRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`👨‍💼 Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📚 Exam Portal Admin: http://localhost:${PORT}/api/admin/exam`);
  console.log(`🎓 Student Portal: http://localhost:${PORT}/api/student`);
  console.log(`🍪 Cookie-based authentication enabled`);
  
  // Start token cleanup service
  TokenCleanupService.startCleanup();
});

export default app;
