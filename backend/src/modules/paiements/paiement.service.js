const repository = require("./paiement.repository");
const createCrudService = require("../../shared/crud.service");
const ApiError = require("../../utils/ApiError");

const service = createCrudService(repository, "Paiement");
service.create = async (data) => {
  const result = await repository.createPayment(data);
  if (result.error === "sale_not_found") throw new ApiError(404, "Vente introuvable");
  if (result.error === "client_mismatch") throw new ApiError(422, "Le client ne correspond pas a la vente");
  if (result.error === "overpayment") throw new ApiError(422, `Le paiement depasse le reste de ${result.remaining}`);
  return result.payment;
};
service.cancel = async (id) => {
  const result = await repository.cancelPayment(id);
  if (result.error) throw new ApiError(404, "Paiement introuvable");
  return result.payment;
};

module.exports = service;
