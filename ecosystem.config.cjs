// PM2 Ecosystem Config for DrawSpy Game Server
// Usage:
//   pnpm --filter server build
//   pm2 start ecosystem.config.cjs
//   pm2 save
//   pm2 startup  ← run the outputted command as root

module.exports = {
  apps: [
    {
      name: 'drawspy-server',
      script: './apps/server/dist/index.js',
      instances: 1, // Socket.IO requires sticky sessions for multi-instance; keep 1 unless using Redis adapter
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      kill_timeout: 10000,
      wait_ready: false,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      // Override per environment:
      // pm2 start ecosystem.config.cjs --env production
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001,
      },
      // Log config
      error_file: './logs/drawspy-error.log',
      out_file: './logs/drawspy-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
