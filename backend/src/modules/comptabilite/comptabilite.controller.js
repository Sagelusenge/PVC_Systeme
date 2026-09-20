const service = require("./comptabilite.service");
const createCrudController = require("../../shared/crud.controller");
const { success } = require("../../utils/response");

module.exports = {
  comptes: createCrudController(service.comptes, "Compte"),
  sousComptes: createCrudController(service.sousComptes, "Sous-compte"),
  journaux: createCrudController(service.journaux, "Journal"),
  ecritures: createCrudController(service.ecritures, "Ecriture comptable"),
  report: (view) => async (req, res) => success(res, await service.report(view)),
  references: async (req, res) => success(res, await service.references()),
  getExchangeRate: async (req, res) => success(res, await service.getExchangeRate()),
  updateExchangeRate: async (req, res) => success(res, await service.updateExchangeRate(req.body.taux), "Taux de change modifie"),
};
