const service = require("./paiement.service");
const createCrudController = require("../../shared/crud.controller");
const { success } = require("../../utils/response");
const controller = createCrudController(service, "Paiement");
controller.cancel = async (req, res) => success(res, await service.cancel(req.params.id), "Paiement annule");
module.exports = controller;
