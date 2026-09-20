const service = require("./auth.service");
const { success } = require("../../utils/response");

async function login(req, res) {
  return success(res, await service.login(req.body), "Connexion reussie");
}

async function me(req, res) {
  return success(res, req.user);
}

async function updateProfile(req, res) {
  return success(res, await service.updateProfile(req.user.id, req.body), "Profil mis a jour");
}

module.exports = { login, me, updateProfile };
