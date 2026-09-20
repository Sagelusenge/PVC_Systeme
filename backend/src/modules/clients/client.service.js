const repository = require("./client.repository");
const createCrudService = require("../../shared/crud.service");

const service = createCrudService(repository, "Client");
service.history = async (id) => {
  await service.get(id);
  return repository.history(id);
};

module.exports = service;
