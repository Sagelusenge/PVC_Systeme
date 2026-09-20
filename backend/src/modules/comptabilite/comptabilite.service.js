const repository = require("./comptabilite.repository");
const createCrudService = require("../../shared/crud.service");

module.exports = {
  comptes: createCrudService(repository.comptes, "Compte"),
  sousComptes: createCrudService(repository.sousComptes, "Sous-compte"),
  journaux: createCrudService(repository.journaux, "Journal"),
  ecritures: createCrudService(repository.ecritures, "Ecriture comptable"),
  report: repository.report,
  references: repository.references,
  getExchangeRate: repository.getExchangeRate,
  updateExchangeRate: repository.updateExchangeRate,
};
