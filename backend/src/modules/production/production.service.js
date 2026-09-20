const repository = require("./production.repository");
const createCrudService = require("../../shared/crud.service");
const ApiError = require("../../utils/ApiError");

const products = createCrudService(repository.products, "Produit fini");
const entries = createCrudService(repository.entries, "Entree de production");
entries.create = async (data) => {
  const entry = await repository.createEntry(data);
  if (!entry) throw new ApiError(404, "Produit fini introuvable");
  return entry;
};

module.exports = { products, entries };
