const Joi = require("joi");

const fields = {
  code: Joi.string().trim().max(50),
  raison_sociale: Joi.string().trim().max(100),
  adresse: Joi.string().trim().max(255).allow(null, ""),
  conditions_paiement: Joi.string().trim().max(100).allow(null, ""),
  solde_compte: Joi.number().precision(2).min(0),
};
const createSchema = Joi.object({ ...fields, code: fields.code.required(), raison_sociale: fields.raison_sociale.required() });
const updateSchema = Joi.object(fields).min(1);

module.exports = { createSchema, updateSchema };
