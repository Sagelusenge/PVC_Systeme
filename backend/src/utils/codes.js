const { query } = require("../config/database");

async function nextCode({ table, column, prefix, width = 4, connection = { query } }) {
  const rows = await connection.query(
    `SELECT \`${column}\` AS code FROM \`${table}\` WHERE \`${column}\` LIKE ?`,
    [`${prefix}%`]
  );
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escapedPrefix}(\\d+)$`, "i");
  const highest = rows.reduce((max, row) => {
    const match = String(row.code || "").match(pattern);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(width, "0")}`;
}

module.exports = { nextCode };
