const service = require("./commande.service");
module.exports = require("../../shared/crud.controller")(service, "Commande");
