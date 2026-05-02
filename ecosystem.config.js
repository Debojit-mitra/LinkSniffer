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
      script: "dist/index.js",
      env: {
        PORT: 5002,
        NODE_ENV: "production",
      },
    },
  ],
};
