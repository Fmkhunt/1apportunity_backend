module.exports = {
  apps: [
    {
      name: 'user-service',
      cwd: '/opt/tresurehunt-backend/user-service',
      script: 'dist/app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/tresurehunt/user-service-error.log',
      out_file: '/var/log/tresurehunt/user-service-out.log',
      log_file: '/var/log/tresurehunt/user-service.log',
      time: true
    },
    {
      name: 'claim-service',
      cwd: '/opt/tresurehunt-backend/claim-service',
      script: 'dist/app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/tresurehunt/claim-service-error.log',
      out_file: '/var/log/tresurehunt/claim-service-out.log',
      log_file: '/var/log/tresurehunt/claim-service.log',
      time: true
    },
    {
      name: 'hunt-service',
      cwd: '/opt/tresurehunt-backend/hunt-service',
      script: 'dist/app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: '/var/log/tresurehunt/hunt-service-error.log',
      out_file: '/var/log/tresurehunt/hunt-service-out.log',
      log_file: '/var/log/tresurehunt/hunt-service.log',
      time: true
    },
    {
      name: 'wallet-service',
      cwd: '/opt/tresurehunt-backend/wallet-service',
      script: 'dist/app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      error_file: '/var/log/tresurehunt/wallet-service-error.log',
      out_file: '/var/log/tresurehunt/wallet-service-out.log',
      log_file: '/var/log/tresurehunt/wallet-service.log',
      time: true
    }
  ]
};