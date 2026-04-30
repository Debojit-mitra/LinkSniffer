module.exports = {
  apps: [
    {
      name: "linksniffer-frontend",
      cwd: "./client",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3003,
      },
    },
    {
      name: "linksniffer-backend",
      cwd: "./server",
      script: "app.py",
      interpreter: "venv/bin/python",
      env: {
        PORT: 5002,
      },
    },
  ],
};
