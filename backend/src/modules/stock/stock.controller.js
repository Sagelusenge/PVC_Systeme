const service = require("./stock.service");
const createCrudController = require("../../shared/crud.controller");
const { success } = require("../../utils/response");

module.exports = {
  materials: createCrudController(service.materials, "Matiere premiere"),
  buyers: createCrudController(service.buyers, "Agent d'achat"),
  entries: createCrudController(service.entries, "Entree de stock"),
  exits: createCrudController(service.exits, "Sortie de stock"),
  movements: async (req, res) => success(res, await service.movements(req.query)),
  alerts: async (req, res) => success(res, await service.alerts()),
};
