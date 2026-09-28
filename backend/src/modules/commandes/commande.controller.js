const service = require("./commande.service");
const controller = require("../../shared/crud.controller")(service, "Commande");
const { success } = require("../../utils/response");

controller.deliver = async (req, res) => success(
  res,
  await service.deliver(req.params.id, req.user.nom_utilisateur),
  "Commande livrée, vente et écritures créées"
);

module.exports = controller;
