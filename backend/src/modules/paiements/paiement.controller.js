const service = require("./paiement.service");
const createCrudController = require("../../shared/crud.controller");
const { success } = require("../../utils/response");
const controller = createCrudController(service, "Paiement");
controller.create = async (req, res) => success(res, await service.create({ ...req.body, _id_user: req.user.nom_utilisateur }), "Règlement et écritures enregistrés", 201);
controller.cancel = async (req, res) => success(res, await service.cancel(req.params.id, req.user.nom_utilisateur), "Paiement annulé");
module.exports = controller;
