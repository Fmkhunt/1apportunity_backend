import { TEnvironment } from '../types';

const env = process.env as unknown as TEnvironment;

export const authConfig = {
  jwt: {
    secret: env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret: env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    expiresIn: env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: env.APP_NAME || 'TechMultiverse',
    audience: env.APP_URL || 'http://localhost:3000',
  },
  bcrypt: {
    saltRounds: 12,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  authRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;

export const validatePassword = (password: string): boolean => {
  const { passwordPolicy } = authConfig;

  if (password.length < passwordPolicy.minLength) return false;
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) return false;
  if (passwordPolicy.requireNumbers && !/\d/.test(password)) return false;
  if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
};

export const getPasswordValidationMessage = (): string => {
  const { passwordPolicy } = authConfig;
  return `Password must be at least ${passwordPolicy.minLength} characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.`;
};