const repository = require("./client.repository");
const createCrudService = require("../../shared/crud.service");
const { nextCode } = require("../../utils/codes");

const service = createCrudService(repository, "Client");
const createClient = service.create;
service.create = async (data) => createClient({
  ...data,
  code: data.code || await nextCode({ table: "tclient", column: "code", prefix: "CLI-" }),
});
service.history = async (id) => {
  await service.get(id);
  return repository.history(id);
};

module.exports = service;
