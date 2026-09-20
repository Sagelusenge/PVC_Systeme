const { query } = require("../config/database");
const { getPagination } = require("../utils/pagination");

function createCrudRepository(config) {
  const { table, idColumn = "id", columns, searchColumns = [], defaultOrder = idColumn } = config;

  function buildFilters(params, values) {
    const clauses = [];
    if (params.q && searchColumns.length) {
      clauses.push(`(${searchColumns.map((column) => `\`${column}\` LIKE ?`).join(" OR ")})`);
      searchColumns.forEach(() => values.push(`%${params.q}%`));
    }

    for (const column of columns) {
      if (params[column] !== undefined && params[column] !== "") {
        clauses.push(`\`${column}\` = ?`);
        values.push(params[column]);
      }
    }
    return clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  }

  return {
    config,
    async list(params = {}) {
      const { page, limit, offset } = getPagination(params);
      const values = [];
      const where = buildFilters(params, values);
      const countRows = await query(`SELECT COUNT(*) total FROM \`${table}\`${where}`, values);
      const rows = await query(
        `SELECT * FROM \`${table}\`${where} ORDER BY \`${defaultOrder}\` DESC LIMIT ? OFFSET ?`,
        [...values, limit, offset]
      );
      return { rows, total: countRows[0].total, page, limit };
    },
    async findById(id, connection = { query }) {
      const rows = await connection.query(
        `SELECT * FROM \`${table}\` WHERE \`${idColumn}\` = ? LIMIT 1`,
        [id]
      );
      return rows[0] || null;
    },
    async create(data, connection = { query }) {
      const keys = columns.filter((column) => data[column] !== undefined);
      const result = await connection.query(
        `INSERT INTO \`${table}\` (${keys.map((key) => `\`${key}\``).join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
        keys.map((key) => data[key])
      );
      return this.findById(result.insertId, connection);
    },
    async update(id, data, connection = { query }) {
      const keys = columns.filter((column) => data[column] !== undefined);
      if (!keys.length) return this.findById(id, connection);
      await connection.query(
        `UPDATE \`${table}\` SET ${keys.map((key) => `\`${key}\` = ?`).join(", ")} WHERE \`${idColumn}\` = ?`,
        [...keys.map((key) => data[key]), id]
      );
      return this.findById(id, connection);
    },
    async remove(id, connection = { query }) {
      const result = await connection.query(
        `DELETE FROM \`${table}\` WHERE \`${idColumn}\` = ?`,
        [id]
      );
      return result.affectedRows > 0;
    },
  };
}

module.exports = createCrudRepository;
