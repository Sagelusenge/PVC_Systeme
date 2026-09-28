const fs = require("fs");
const path = require("path");
const mariadb = require("mariadb");
const env = require("../src/config/env");

async function migrateDatabase() {
  const directory = path.resolve(__dirname, "../../database/migrations");
  const files = fs.readdirSync(directory).filter((name) => /^\d{3}_/.test(name) && !name.startsWith("001_")).sort();
  const connection = await mariadb.createConnection({ ...env.db, multipleStatements: true });
  try {
    await connection.query(`CREATE TABLE IF NOT EXISTS tschema_migrations (
      nom_fichier VARCHAR(150) NOT NULL PRIMARY KEY,
      date_execution TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    for (const file of files) {
      const applied = await connection.query("SELECT 1 FROM tschema_migrations WHERE nom_fichier=? LIMIT 1", [file]);
      if (applied[0]) {
        console.log(`Migration deja appliquee: ${file}`);
        continue;
      }
      await connection.query(fs.readFileSync(path.join(directory, file), "utf8"));
      await connection.query("INSERT INTO tschema_migrations (nom_fichier) VALUES (?)", [file]);
      console.log(`Migration appliquee: ${file}`);
    }
  } finally {
    await connection.end();
  }
}

if (require.main === module) migrateDatabase().catch((error) => { console.error("Migration echouee:", error.message); process.exit(1); });
module.exports = migrateDatabase;
