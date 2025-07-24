import { Application } from 'express';
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import adminRoutes from '@/routes/admin';

export const setupRoutes = (app: Application): void => {
  // API routes

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/admin', adminRoutes);

  // Health check route
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Default route
  app.get('/', (req, res) => {
    res.json({
      message: `Welcome to ${process.env.APP_NAME || 'TechMultiverse'} API`,
      version: '1.0.0',
      documentation: '/api/docs', // You can add API documentation here
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      status: 0,
      message: 'Route not found',
      success: false,
      data: null,
    });
  });
};