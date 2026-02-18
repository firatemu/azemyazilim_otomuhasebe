module.exports = {
  apps: [{
    name: 'admin-stage',
    script: 'npx',
    args: 'vite preview --port 3005 --host',
    cwd: '/var/www/admin-stage',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000,
    shutdown_with_message: true,
    env: {
      NODE_ENV: 'staging',
      VITE_API_URL: 'https://staging-api.otomuhasebe.com/api',
      VITE_APP_ENV: 'staging'
    },
    error_file: '/var/log/otomuhasebe/admin-stage/error.log',
    out_file: '/var/log/otomuhasebe/admin-stage/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};

