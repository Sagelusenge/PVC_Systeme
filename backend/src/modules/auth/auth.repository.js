const { query } = require("../../config/database");

async function findByUsername(username) {
  const rows = await query(
    `SELECT u.*, r.nom_role, r.description AS role_description
     FROM tutilisateurs u
     LEFT JOIN troles r ON r.id = u.role_id
     WHERE u.nom_utilisateur = ? LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

async function updatePassword(id, passwordHash) {
  await query("UPDATE tutilisateurs SET mot_de_passe = ? WHERE id = ?", [passwordHash, id]);
}

async function findById(id) {
  const rows = await query(
    `SELECT u.*, r.nom_role, r.description AS role_description
     FROM tutilisateurs u
     LEFT JOIN troles r ON r.id = u.role_id
     WHERE u.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function updateProfile(id, data) {
  const fields = [];
  const values = [];
  for (const key of ["nom_utilisateur", "email", "photo_url", "mot_de_passe"]) {
    if (data[key] !== undefined) {
      fields.push(`\`${key}\` = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length) {
    await query(`UPDATE tutilisateurs SET ${fields.join(", ")} WHERE id = ?`, [...values, id]);
  }
  return findById(id);
}

module.exports = { findByUsername, findById, updatePassword, updateProfile };
