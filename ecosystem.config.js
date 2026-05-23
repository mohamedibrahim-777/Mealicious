module.exports = {
  apps: [
    {
      name: "mealicious",
      cwd: "/var/www/Mealicious/.next/standalone",
      script: "server.js",
      interpreter: "bun",
      env: {
        NODE_ENV: "production",
        PORT: 3010,
        HOSTNAME: "0.0.0.0",
        DATABASE_URL: "file:/var/www/Mealicious/db/custom.db",
      },
      max_memory_restart: "1G",
    },
  ],
};
