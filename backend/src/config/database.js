const mariadb = require("mariadb");
const env = require("./env");

const pool = mariadb.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  connectionLimit: env.db.connectionLimit,
  decimalAsNumber: true,
  insertIdAsNumber: true,
  bigIntAsNumber: true,
});

async function testDatabaseConnection() {
  const connection = await pool.getConnection();

  try {
    const rows = await connection.query(
      "SELECT DATABASE() AS database_name, NOW() AS server_time"
    );

    return rows[0];
  } finally {
    connection.release();
  }
}

async function query(sql, params = []) {
  return pool.query(sql, params);
}

async function withTransaction(callback) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  testDatabaseConnection()
    .then((result) => {
      console.log("Database connected:", result);
      return pool.end();
    })
    .catch((error) => {
      console.error("Database connection failed:", error.message);
      if (error.cause) {
        console.error("Cause:", error.cause.message);
      }
      process.exit(1);
    });
}

module.exports = {
  pool,
  query,
  withTransaction,
  testDatabaseConnection,
};
