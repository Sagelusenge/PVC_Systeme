const Joi = require("joi");

module.exports = Joi.object({
  id_client: Joi.number().integer().positive().required(),
  id_vente: Joi.number().integer().positive().required(),
  date_paiement: Joi.date().iso(),
  libelle: Joi.string().trim().max(200).required(),
  montant_paye: Joi.number().positive().precision(2).required(),
  um: Joi.string().valid("USD", "CDF").default("USD"),
  type_paiement: Joi.string().valid("Comptant", "Crédit", "Anticipation").required(),
});
