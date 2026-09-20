const Joi = require("joi");
const line = Joi.object({ id_produit_fini: Joi.number().integer().positive().required(), quantite_vendue: Joi.number().positive().required(), prix_vente_unitaire_reel: Joi.number().min(0).required() });
module.exports = {
  createSchema: Joi.object({ date_vente: Joi.date().iso().required(), client_id: Joi.number().integer().positive().required(), montant_payee: Joi.number().min(0).default(0), type_paiement: Joi.string().valid("CASH", "CREDIT", "ANTICIPATION").required(), details: Joi.array().items(line).min(1).required() }),
  updateSchema: Joi.object({ date_vente: Joi.date().iso(), type_paiement: Joi.string().valid("CASH", "CREDIT", "ANTICIPATION") }).min(1),
};
