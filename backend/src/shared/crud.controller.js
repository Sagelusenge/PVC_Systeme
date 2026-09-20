const { success } = require("../utils/response");
const { paginationMeta } = require("../utils/pagination");

function createCrudController(service, resourceName) {
  return {
    async list(req, res) {
      const result = await service.list(req.query);
      return success(res, result.rows, `${resourceName}: liste`, 200, paginationMeta(result.total, result.page, result.limit));
    },
    async get(req, res) {
      return success(res, await service.get(req.params.id));
    },
    async create(req, res) {
      return success(res, await service.create(req.body), `${resourceName} cree`, 201);
    },
    async update(req, res) {
      return success(res, await service.update(req.params.id, req.body), `${resourceName} modifie`);
    },
    async remove(req, res) {
      await service.remove(req.params.id);
      return res.status(204).send();
    },
  };
}

module.exports = createCrudController;
