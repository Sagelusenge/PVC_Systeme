const repository = require("./stock.repository");
const createCrudService = require("../../shared/crud.service");
const ApiError = require("../../utils/ApiError");

const materials = createCrudService(repository.materials, "Matiere premiere");
const buyers = createCrudService(repository.buyers, "Agent d'achat");
const entries = createCrudService(repository.entries, "Entree de stock");
const exits = createCrudService(repository.exits, "Sortie de stock");

entries.create = async (data) => {
  const entry = await repository.createEntry(data);
  if (!entry) throw new ApiError(404, "Matiere premiere introuvable");
  return entry;
};
exits.create = async (data) => {
  const result = await repository.createExit(data);
  if (result.error === "not_found") throw new ApiError(404, "Matiere premiere introuvable");
  if (result.error === "insufficient") throw new ApiError(409, `Stock insuffisant. Disponible: ${result.available}`);
  return result.exit;
};

module.exports = { materials, buyers, entries, exits, movements: repository.movements, alerts: repository.alerts };
