const service = require("./user.service");
const { success } = require("../../utils/response");
const { paginationMeta } = require("../../utils/pagination");

async function list(req, res) {
  const result = await service.list(req.query);
  return success(res, result.rows, "Utilisateurs", 200, paginationMeta(result.total, result.page, result.limit));
}
async function get(req, res) { return success(res, await service.get(req.params.id)); }
async function create(req, res) { return success(res, await service.create(req.body), "Utilisateur cree", 201); }
async function update(req, res) { return success(res, await service.update(req.params.id, req.body), "Utilisateur modifie"); }
async function deactivate(req, res) { return success(res, await service.deactivate(req.params.id, req.user.id), "Utilisateur desactive"); }
async function roles(req, res) { return success(res, await service.listRoles()); }
async function createRole(req, res) { return success(res, await service.createRole(req.body), "Role cree", 201); }
async function updateRole(req, res) { return success(res, await service.updateRole(req.params.id, req.body), "Role modifie"); }
async function removeRole(req, res) { await service.removeRole(req.params.id); return res.status(204).send(); }

module.exports = { list, get, create, update, deactivate, roles, createRole, updateRole, removeRole };
