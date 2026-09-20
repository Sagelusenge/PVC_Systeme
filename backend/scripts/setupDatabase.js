const fs = require("fs");
const path = require("path");
const mariadb = require("mariadb");
const env = require("../src/config/env");
const migrateDatabase = require("./migrateDatabase");

const schemaPath = path.resolve(__dirname, "../../database/schema/db_pvc.sql");

function escapeIdentifier(identifier) {
  return `\`${String(identifier).replace(/`/g, "``")}\``;
}

function splitSqlStatements(sql) {
  const statements = [];
  let delimiter = ";";
  let buffer = "";

  for (const line of sql.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (/^DELIMITER\s+/i.test(trimmed)) {
      delimiter = trimmed.replace(/^DELIMITER\s+/i, "");
      continue;
    }

    buffer += `${line}\n`;

    if (buffer.trimEnd().endsWith(delimiter)) {
      const statement = buffer.trimEnd().slice(0, -delimiter.length).trim();
      if (statement) {
        statements.push(statement);
      }
      buffer = "";
    }
  }

  if (buffer.trim()) {
    statements.push(buffer.trim());
  }

  return statements;
}

async function setupDatabase() {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const adminConnection = await mariadb.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: false,
  });

  try {
    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS ${escapeIdentifier(env.db.database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci`
    );
  } finally {
    await adminConnection.end();
  }

  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  const statements = splitSqlStatements(schemaSql);

  const dbConnection = await mariadb.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    multipleStatements: false,
  });

  try {
    for (const statement of statements) {
      await dbConnection.query(statement);
    }
  } finally {
    await dbConnection.end();
  }

  console.log(`Database '${env.db.database}' is ready.`);
  console.log(`Imported ${statements.length} SQL statements from ${schemaPath}.`);
  await migrateDatabase();
}

setupDatabase().catch((error) => {
  console.error("Database setup failed:", error.message);
  if (error.cause) {
    console.error("Cause:", error.cause.message);
  }
  process.exit(1);
});
