const ApiError = require("../utils/ApiError");

function createCrudService(repository, resourceName) {
  return {
    list: (params) => repository.list(params),
    async get(id) {
      const item = await repository.findById(id);
      if (!item) throw new ApiError(404, `${resourceName} introuvable`);
      return item;
    },
    create: (data) => repository.create(data),
    async update(id, data) {
      await this.get(id);
      return repository.update(id, data);
    },
    async remove(id) {
      await this.get(id);
      await repository.remove(id);
    },
  };
}

module.exports = createCrudService;
