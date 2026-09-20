const fs = require("fs");
const path = require("path");
const mariadb = require("mariadb");
const env = require("../src/config/env");

async function migrateDatabase() {
  const directory = path.resolve(__dirname, "../../database/migrations");
  const files = fs.readdirSync(directory).filter((name) => /^\d{3}_/.test(name) && !name.startsWith("001_")).sort();
  const connection = await mariadb.createConnection({ ...env.db, multipleStatements: true });
  try {
    for (const file of files) {
      await connection.query(fs.readFileSync(path.join(directory, file), "utf8"));
      console.log(`Migration appliquee: ${file}`);
    }
  } finally {
    await connection.end();
  }
}

if (require.main === module) migrateDatabase().catch((error) => { console.error("Migration echouee:", error.message); process.exit(1); });
module.exports = migrateDatabase;
