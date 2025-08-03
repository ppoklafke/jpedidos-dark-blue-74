module.exports = {
  apps: [{
    name: 'jpedidos-app',
    script: 'npm',
    args: 'run preview',
    cwd: '/home/ubuntu/jpedidos-dark-blue-74',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    }
  }]
};
