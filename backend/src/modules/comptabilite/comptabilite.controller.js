const service = require("./comptabilite.service");
const createCrudController = require("../../shared/crud.controller");
const { success } = require("../../utils/response");

const ecritures = createCrudController(service.ecritures, "Ecriture comptable");
ecritures.create = async (req, res) => success(
  res,
  await service.ecritures.create(req.body, req.user?.nom_utilisateur || req.user?.email || "systeme"),
  "Ecriture equilibree creee",
  201
);

module.exports = {
  comptes: createCrudController(service.comptes, "Compte"),
  sousComptes: createCrudController(service.sousComptes, "Sous-compte"),
  journaux: createCrudController(service.journaux, "Journal"),
  ecritures,
  report: (view) => async (req, res) => success(res, await service.report(view)),
  references: async (req, res) => success(res, await service.references()),
  getExchangeRate: async (req, res) => success(res, await service.getExchangeRate()),
  updateExchangeRate: async (req, res) => success(res, await service.updateExchangeRate(req.body.taux), "Taux de change modifie"),
};
