const service = require("./vente.service");
const controller = require("../../shared/crud.controller")(service, "Vente");
const { success } = require("../../utils/response");

controller.create = async (req, res) => success(
  res,
  await service.create({ ...req.body, _id_user: req.user.nom_utilisateur }),
  "Vente, stock et écritures enregistrés",
  201
);

module.exports = controller;
