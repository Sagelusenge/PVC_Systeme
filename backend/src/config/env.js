const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

function toBoolean(value, fallback = false) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "change_this_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "pvc_app",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "db_pvc_renovee",
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    ssl: toBoolean(process.env.DB_SSL)
      ? { rejectUnauthorized: toBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, true) }
      : undefined,
  },
};

module.exports = env;
