import { Application } from 'express';
import walletRoutes from './wallet.routes';
import paymentRoutes from './payment.routes';
import withdrawalRoutes from './withdrawal.routes';
import adminWithdrawalRoutes from './admin/withdrawal.routes';

export const setupRoutes = (app: Application): void => {
  // API routes
  app.use('/api/wallet', walletRoutes);
  app.use('/api/payment', paymentRoutes);
  app.use('/api/withdrawal', withdrawalRoutes);
  app.use('/api/admin/withdrawal', adminWithdrawalRoutes);

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