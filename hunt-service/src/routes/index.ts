import { Application } from 'express';
import taskRoutes from './task.routes';

export const setupRoutes = (app: Application): void => {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // API routes
  app.use('/api/tasks', taskRoutes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Welcome to Hunt Service API',
      version: '1.0.0',
      endpoints: {
        tasks: '/api/tasks',
        health: '/health',
      },
    });
  });
};