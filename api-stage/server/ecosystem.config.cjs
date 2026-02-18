module.exports = {
  apps: [{
    name: 'api-stage',
    script: './dist/src/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'staging',
      PORT: 3020,
      STAGING_DEFAULT_TENANT_ID: 'cmi5of04z0000ksb3g5eyu6ts'
    },
    error_file: '/root/.pm2/logs/api-stage-error.log',
    out_file: '/root/.pm2/logs/api-stage-out.log',
    log_date_format: 'YYYY-MM-DD_HH-mm-ss',
    log_file: '/root/.pm2/logs/api-stage-out.log',
    merge_logs: true
  }]
};
