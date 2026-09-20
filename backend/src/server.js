const app = require("./app");
const env = require("./config/env");
const { testDatabaseConnection } = require("./config/database");
const { pool } = require("./config/database");

async function startServer() {
  try {
    await testDatabaseConnection();
    console.log("Database connection ready.");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, closing server.`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer();
