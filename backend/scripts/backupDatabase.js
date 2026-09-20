const fs = require("fs");
const path = require("path");
const mariadb = require("mariadb");
const env = require("../src/config/env");

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (Buffer.isBuffer(value)) return `X'${value.toString("hex")}'`;
  if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace("T", " ")}'`;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "''").replace(/\0/g, "\\0")}'`;
}

function portableCreate(statement) {
  return statement.replace(/DEFINER\s*=\s*`[^`]+`@`[^`]+`\s*/i, "");
}

async function backupDatabase() {
  const connection = await mariadb.createConnection(env.db);
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const outputDirectory = path.resolve(__dirname, "../../backups");
  const outputPath = path.join(outputDirectory, `${env.db.database}_${stamp}.sql`);
  const chunks = ["SET FOREIGN_KEY_CHECKS=0;", `CREATE DATABASE IF NOT EXISTS \`${env.db.database}\`;`, `USE \`${env.db.database}\`;`];

  try {
    const objects = await connection.query(
      "SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.TABLES WHERE TABLE_SCHEMA=? ORDER BY TABLE_TYPE, TABLE_NAME",
      [env.db.database]
    );
    const views = objects.filter((object) => object.TABLE_TYPE === "VIEW");
    for (const view of views) chunks.push(`DROP VIEW IF EXISTS \`${view.TABLE_NAME}\`;`);

    for (const object of objects) {
      const name = object.TABLE_NAME;
      if (object.TABLE_TYPE === "VIEW") continue;
      const createRows = await connection.query(`SHOW CREATE TABLE \`${name}\``);
      chunks.push(`DROP TABLE IF EXISTS \`${name}\`;`, `${createRows[0]["Create Table"]};`);
      const rows = await connection.query(`SELECT * FROM \`${name}\``);
      if (rows.length) {
        const columns = Object.keys(rows[0]);
        const values = rows.map((row) => `(${columns.map((column) => sqlValue(row[column])).join(",")})`).join(",\n");
        chunks.push(`INSERT INTO \`${name}\` (${columns.map((column) => `\`${column}\``).join(",")}) VALUES\n${values};`);
      }
    }

    for (const view of views) {
      const rows = await connection.query(`SHOW CREATE VIEW \`${view.TABLE_NAME}\``);
      chunks.push(`${portableCreate(rows[0]["Create View"])};`);
    }

    const routines = await connection.query(
      "SELECT ROUTINE_NAME, ROUTINE_TYPE FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA=? ORDER BY ROUTINE_TYPE, ROUTINE_NAME",
      [env.db.database]
    );
    for (const routine of routines) {
      const type = routine.ROUTINE_TYPE.toUpperCase();
      const rows = await connection.query(`SHOW CREATE ${type} \`${routine.ROUTINE_NAME}\``);
      const createKey = type === "PROCEDURE" ? "Create Procedure" : "Create Function";
      chunks.push(`DROP ${type} IF EXISTS \`${routine.ROUTINE_NAME}\`;`, `DELIMITER $$\n${portableCreate(rows[0][createKey])}$$\nDELIMITER ;`);
    }

    const triggers = await connection.query(
      "SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA=? ORDER BY TRIGGER_NAME",
      [env.db.database]
    );
    for (const trigger of triggers) {
      const rows = await connection.query(`SHOW CREATE TRIGGER \`${trigger.TRIGGER_NAME}\``);
      chunks.push(`DROP TRIGGER IF EXISTS \`${trigger.TRIGGER_NAME}\`;`, `DELIMITER $$\n${portableCreate(rows[0]["SQL Original Statement"])}$$\nDELIMITER ;`);
    }
    chunks.push("SET FOREIGN_KEY_CHECKS=1;");
    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.writeFileSync(outputPath, `${chunks.join("\n\n")}\n`, "utf8");
    console.log(`Backup cree: ${outputPath}`);
    return outputPath;
  } finally {
    await connection.end();
  }
}

if (require.main === module) backupDatabase().catch((error) => { console.error("Backup echoue:", error.message); process.exit(1); });
module.exports = backupDatabase;
