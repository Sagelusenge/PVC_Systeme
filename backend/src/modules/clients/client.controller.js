const service = require("./client.service");
const createCrudController = require("../../shared/crud.controller");
const { success } = require("../../utils/response");

const controller = createCrudController(service, "Client");
controller.history = async (req, res) => success(res, await service.history(req.params.id));

module.exports = controller;
