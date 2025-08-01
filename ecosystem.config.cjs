module.exports = {
  apps: [{
    name: 'jpedidos-app',
    script: 'npm',
    args: 'run preview',
    cwd: '/home/ubuntu/jpedidos-dark-blue-74',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
};