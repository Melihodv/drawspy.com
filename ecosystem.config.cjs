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
      script: 'node_modules/.bin/tsx',
      args: 'src/index.ts',
      cwd: './apps/server',
      instances: 1,
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
    },
  ],
};
