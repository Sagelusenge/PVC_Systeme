const repository = require("./commande.repository");
const createCrudService = require("../../shared/crud.service");
const ApiError = require("../../utils/ApiError");

const service = createCrudService(repository, "Commande");
service.get = async (id) => {
  const order = await repository.findDetailed(id);
  if (!order) throw new ApiError(404, "Commande introuvable");
  return order;
};
service.create = async (data) => service.get(await repository.createWithDetails(data));

module.exports = service;
