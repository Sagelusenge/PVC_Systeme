const { query } = require("../../config/database");
const { getPagination } = require("../../utils/pagination");

async function list(params = {}) {
  const { page, limit, offset } = getPagination(params);
  const search = params.q ? `%${params.q}%` : null;
  const where = search ? "WHERE u.nom_utilisateur LIKE ? OR u.email LIKE ?" : "";
  const values = search ? [search, search] : [];
  const totals = await query(`SELECT COUNT(*) total FROM tutilisateurs u ${where}`, values);
  const rows = await query(
    `SELECT u.id, u.nom_utilisateur, u.email, u.photo_url, u.statut, u.role_id, u.date_creation, r.nom_role
     FROM tutilisateurs u LEFT JOIN troles r ON r.id = u.role_id ${where}
     ORDER BY u.id DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  return { rows, total: totals[0].total, page, limit };
}

async function findById(id) {
  const rows = await query(
    `SELECT u.id, u.nom_utilisateur, u.email, u.photo_url, u.statut, u.role_id, u.date_creation, r.nom_role
     FROM tutilisateurs u LEFT JOIN troles r ON r.id = u.role_id WHERE u.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const result = await query(
    "INSERT INTO tutilisateurs (nom_utilisateur, mot_de_passe, email, statut, role_id) VALUES (?, ?, ?, ?, ?)",
    [data.nom_utilisateur, data.mot_de_passe, data.email || null, data.statut || "Actif", data.role_id]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const fields = [];
  const values = [];
  for (const key of ["nom_utilisateur", "email", "statut", "role_id", "mot_de_passe"]) {
    if (data[key] !== undefined) {
      fields.push(`\`${key}\` = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length) await query(`UPDATE tutilisateurs SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
  return findById(id);
}

async function listRoles() {
  return query("SELECT id, nom_role, description, statut FROM troles ORDER BY nom_role");
}

async function findRoleById(id) {
  const rows = await query("SELECT id, nom_role, description, statut FROM troles WHERE id=? LIMIT 1", [id]);
  return rows[0] || null;
}

async function createRole(data) {
  const result = await query("INSERT INTO troles (nom_role,description,statut) VALUES (?,?,?)", [data.nom_role, data.description || null, data.statut || "Actif"]);
  return findRoleById(result.insertId);
}

async function updateRole(id, data) {
  const fields = []; const values = [];
  for (const key of ["nom_role", "description", "statut"]) {
    if (data[key] !== undefined) { fields.push(`\`${key}\`=?`); values.push(data[key]); }
  }
  if (fields.length) await query(`UPDATE troles SET ${fields.join(",")} WHERE id=?`, [...values, id]);
  return findRoleById(id);
}

async function roleUsage(id) {
  const rows = await query("SELECT COUNT(*) total FROM tutilisateurs WHERE role_id=?", [id]);
  return Number(rows[0].total);
}

async function removeRole(id) {
  return query("DELETE FROM troles WHERE id=?", [id]);
}

module.exports = { list, findById, create, update, listRoles, findRoleById, createRole, updateRole, roleUsage, removeRole };
