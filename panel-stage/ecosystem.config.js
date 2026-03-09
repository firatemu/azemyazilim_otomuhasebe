module.exports = {
    apps: [
        {
            name: "panel-stage",
            cwd: "/var/www/panel-stage/client",
            script: "npm",
            args: "run dev",
            env: {
                NODE_ENV: "development",
                SKIP_ENV_VALIDATION: "true",
                PORT: 3010
            },
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: false,
            error_file: "/var/log/otomuhasebe/panel-stage/error.log",
            out_file: "/var/log/otomuhasebe/panel-stage/out.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            time: true,
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 3010,
            shutdown_with_message: true
        }
    ]
};