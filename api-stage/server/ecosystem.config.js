module.exports = {
  apps: [{
    name: 'api-stage',
    script: './dist/src/main.js',
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      NODE_ENV: 'staging',
      PORT: 3020,
      STAGING_DEFAULT_TENANT_ID: 'cmi5of04z0000ksb3g5eyu6ts'
    }
  }]
};
