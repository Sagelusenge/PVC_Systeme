const service = require("./production.service");
const createCrudController = require("../../shared/crud.controller");

module.exports = {
  products: createCrudController(service.products, "Produit fini"),
  entries: createCrudController(service.entries, "Entree de production"),
};
