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
      script: "./venv/bin/python",
      args: "app.py",
      interpreter: "none",
      env: {
        PORT: 5002,
      },
    },
  ],
};
