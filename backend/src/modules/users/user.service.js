const repository = require("./user.repository");
const ApiError = require("../../utils/ApiError");
const { hashPassword } = require("../../utils/password");

async function get(id) {
  const user = await repository.findById(id);
  if (!user) throw new ApiError(404, "Utilisateur introuvable");
  return user;
}

async function create(data) {
  return repository.create({ ...data, mot_de_passe: await hashPassword(data.mot_de_passe) });
}

async function update(id, data) {
  await get(id);
  const payload = { ...data };
  if (payload.mot_de_passe) payload.mot_de_passe = await hashPassword(payload.mot_de_passe);
  return repository.update(id, payload);
}

async function deactivate(id, currentUserId) {
  if (Number(id) === Number(currentUserId)) throw new ApiError(409, "Vous ne pouvez pas desactiver votre propre compte");
  await get(id);
  return repository.update(id, { statut: "Inactif" });
}

async function createRole(data) { return repository.createRole(data); }
async function updateRole(id, data) {
  if (!(await repository.findRoleById(id))) throw new ApiError(404, "Role introuvable");
  return repository.updateRole(id, data);
}
async function removeRole(id) {
  const role = await repository.findRoleById(id);
  if (!role) throw new ApiError(404, "Role introuvable");
  if (role.nom_role === "Administrateur") throw new ApiError(409, "Le role Administrateur ne peut pas etre supprime");
  if (await repository.roleUsage(id)) throw new ApiError(409, "Ce role est encore attribue a des utilisateurs");
  await repository.removeRole(id);
}

module.exports = { list: repository.list, get, create, update, deactivate, listRoles: repository.listRoles, createRole, updateRole, removeRole };
