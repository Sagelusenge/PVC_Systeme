const repository = require("./comptabilite.repository");
const createCrudService = require("../../shared/crud.service");

const ecritures = createCrudService(repository.ecritures, "Ecriture comptable");
ecritures.create = (data, user) => repository.createEntryPair(data, user);

module.exports = {
  comptes: createCrudService(repository.comptes, "Compte"),
  sousComptes: createCrudService(repository.sousComptes, "Sous-compte"),
  journaux: createCrudService(repository.journaux, "Journal"),
  ecritures,
  report: repository.report,
  references: repository.references,
  getExchangeRate: repository.getExchangeRate,
  updateExchangeRate: repository.updateExchangeRate,
};
