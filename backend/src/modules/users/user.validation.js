const Joi = require("joi");

const fields = {
  nom_utilisateur: Joi.string().trim().min(2).max(50),
  mot_de_passe: Joi.string().min(8).max(128),
  email: Joi.string().email().max(100).allow(null, ""),
  statut: Joi.string().valid("Actif", "Inactif"),
  role_id: Joi.number().integer().positive(),
};

const createSchema = Joi.object({
  nom_utilisateur: fields.nom_utilisateur.required(),
  mot_de_passe: fields.mot_de_passe.required(),
  email: fields.email,
  statut: fields.statut.default("Actif"),
  role_id: fields.role_id.required(),
});
const updateSchema = Joi.object(fields).min(1);
const roleSchema = Joi.object({ nom_role: Joi.string().trim().min(2).max(50).required(), description: Joi.string().trim().max(255).allow(null, ""), statut: Joi.string().valid("Actif", "Inactif").default("Actif") });
const updateRoleSchema = Joi.object({ nom_role: Joi.string().trim().min(2).max(50), description: Joi.string().trim().max(255).allow(null, ""), statut: Joi.string().valid("Actif", "Inactif") }).min(1);

module.exports = { createSchema, updateSchema, roleSchema, updateRoleSchema };
