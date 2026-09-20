const repository = require("./vente.repository");
const createCrudService = require("../../shared/crud.service");
const ApiError = require("../../utils/ApiError");

const service = createCrudService(repository, "Vente");
service.get = async (id) => {
  const sale = await repository.findDetailed(id);
  if (!sale) throw new ApiError(404, "Vente introuvable");
  return sale;
};
service.create = async (data) => {
  const result = await repository.createWithDetails(data);
  if (result.error === "not_found") throw new ApiError(404, `Produit ${result.productId} introuvable`);
  if (result.error === "insufficient") throw new ApiError(409, `Stock insuffisant pour ${result.product.libelle}. Disponible: ${result.product.stock_actuel}`);
  if (result.error === "overpayment") throw new ApiError(422, `Le montant paye depasse le total de ${result.total}`);
  return service.get(result.id);
};

module.exports = service;
