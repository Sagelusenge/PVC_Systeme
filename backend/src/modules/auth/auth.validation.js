const Joi = require("joi");

const loginSchema = Joi.object({
  nom_utilisateur: Joi.string().trim().min(2).max(50).required(),
  mot_de_passe: Joi.string().min(6).max(128).required(),
});

const profileSchema = Joi.object({
  nom_utilisateur: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().max(100).allow(null, ""),
  photo_url: Joi.string().max(750000).allow(null, ""),
  mot_de_passe_actuel: Joi.string().min(6).max(128).allow(""),
  nouveau_mot_de_passe: Joi.string().min(8).max(128).allow(""),
}).with("nouveau_mot_de_passe", "mot_de_passe_actuel");

module.exports = { loginSchema, profileSchema };
