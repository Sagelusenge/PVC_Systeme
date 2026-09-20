const Joi = require("joi");

const line = Joi.object({
  id_produit_fini: Joi.number().integer().positive().required(),
  quantite_commandee: Joi.number().positive().precision(2).required(),
  prix_vente_unitaire: Joi.number().min(0).precision(2).required(),
});
const fields = {
  numero: Joi.string().trim().max(50), date_commande: Joi.date().iso(), client_id: Joi.number().integer().positive(),
  date_livraison_prevue: Joi.date().iso().allow(null), statut: Joi.string().valid("en attente", "livrée", "annulée"),
  montant_anticipation: Joi.number().min(0).precision(2), date_paiement_anticipation: Joi.date().iso().allow(null),
};

module.exports = {
  createSchema: Joi.object({ ...fields, numero: fields.numero.required(), date_commande: fields.date_commande.required(), client_id: fields.client_id.required(), details: Joi.array().items(line).min(1).required() }),
  updateSchema: Joi.object(fields).min(1),
};
