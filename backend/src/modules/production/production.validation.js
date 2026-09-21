const Joi = require("joi");

const productFields = {
  code: Joi.string().trim().max(50),
  libelle: Joi.string().trim().max(100),
  unite: Joi.string().trim().max(20),
  prix_unitaire: Joi.number().precision(2).min(0),
  stock_actuel: Joi.number().precision(2).min(0),
};
const entryFields = {
  id_produit_fini: Joi.number().integer().positive(),
  quantite_entree: Joi.number().positive().precision(2),
  unite_mesure: Joi.string().valid("PIECE", "KG", "Litre"),
  date_entree: Joi.date().iso(),
  cout_production_unitaire: Joi.number().min(0).precision(4).allow(null),
};

module.exports = {
  createProduct: Joi.object({ ...productFields, libelle: productFields.libelle.required(), prix_unitaire: productFields.prix_unitaire.required() }),
  updateProduct: Joi.object(productFields).min(1),
  createEntry: Joi.object({ ...entryFields, id_produit_fini: entryFields.id_produit_fini.required(), quantite_entree: entryFields.quantite_entree.required() }),
  updateEntry: Joi.object(entryFields).min(1),
};
