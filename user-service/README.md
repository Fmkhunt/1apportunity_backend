# TechMultiverse API - Enhanced TypeScript Version

A modern, secure, and scalable Node.js API built with TypeScript, featuring enhanced authentication, service layer architecture, and comprehensive error handling.

## 🚀 Features

- **TypeScript**: Full TypeScript support with strict type checking
- **Enhanced Authentication**: JWT with refresh tokens, password hashing, social login
- **Service Layer**: Clean separation of business logic from controllers
- **Security**: Helmet, CORS, rate limiting, input validation
- **Error Handling**: Comprehensive error handling with custom error classes
- **Validation**: Joi schema validation for all endpoints
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest configuration for unit and integration tests
- **Linting**: ESLint with TypeScript rules
- **Compression**: Response compression for better performance

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hackathon-institute-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   APP_NAME=TechMultiverse
   APP_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/techmultiverse
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── auth.ts      # Authentication configuration
│   └── database.ts  # Database configuration
├── controllers/      # Request handlers
│   └── userController.ts
├── middlewares/      # Express middlewares
│   ├── auth.ts      # Authentication middlewares
│   └── validation.ts # Validation middleware
├── models/          # Database models
│   └── User.ts
├── routes/          # Route definitions
│   ├── auth.ts      # Authentication routes
│   └── index.ts     # Main routes setup
├── services/        # Business logic layer
│   └── authService.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Utility functions
│   ├── AppError.ts  # Custom error classes
│   └── responseHandler.ts
├── validations/     # Joi validation schemas
│   └── authValidation.ts
└── app.ts          # Main application file
```

## 🔐 Authentication System

### Features
- **JWT Tokens**: Access tokens (15min) and refresh tokens (7 days)
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Social Login**: Facebook, Google, and Apple integration
- **Rate Limiting**: Separate limits for auth endpoints
- **Token Refresh**: Automatic token refresh mechanism

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/social-auth` | Social authentication | No |
| POST | `/refresh-token` | Refresh access token | No |
| POST | `/check-registration` | Check if user exists | No |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| POST | `/change-password` | Change password | Yes |
| POST | `/logout` | Logout user | Yes |
| GET | `/user/:userId` | Get user by ID | Yes |

### Health Check
- `GET /health` - Server health status

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start           # Start production server

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Linting
npm run lint        # Check for linting errors
npm run lint:fix    # Fix linting errors automatically
```

### Code Quality

The project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting (recommended)
- **Jest** for testing

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Joi schema validation
- **Password Hashing**: Bcrypt with salt
- **JWT Security**: Secure token handling
- **Error Handling**: No sensitive data exposure

## 📊 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `APP_NAME` | Application name | `TechMultiverse` |
| `APP_URL` | Application URL | `http://localhost:3000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |

## 🚀 Deployment

### Production Build

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Start the server
npm start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Note**: This is an enhanced version of your original Node.js template with TypeScript, improved authentication, service layer architecture, and better security practices.