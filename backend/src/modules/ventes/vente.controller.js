const service = require("./vente.service");
module.exports = require("../../shared/crud.controller")(service, "Vente");
