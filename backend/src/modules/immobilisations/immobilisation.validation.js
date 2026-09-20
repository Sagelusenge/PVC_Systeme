const Joi = require("joi");
const fields = {
  code_materiel: Joi.string().max(50), designation: Joi.string().max(100), date_acquisition: Joi.date().iso(),
  valeur_acquisition: Joi.number().positive(), amortissable: Joi.boolean(), taux_amortissement: Joi.number().min(0).max(100),
  mode_amortissement: Joi.string().valid("lineaire", "degressif"), periodicite: Joi.string().valid("Mensuel", "Annuel"),
  duree_utilisation: Joi.number().integer().positive(), valeur_residuelle: Joi.number().min(0), provenance: Joi.string().max(100).allow(null, ""),
  statut: Joi.string().valid("en service", "en maintenance", "hors service", "vendu"), Coefficient_degressif: Joi.string().max(255).allow(null, ""),
};
module.exports = {
  create: Joi.object({ ...fields, code_materiel: fields.code_materiel.required(), designation: fields.designation.required(), date_acquisition: fields.date_acquisition.required(), valeur_acquisition: fields.valeur_acquisition.required(), taux_amortissement: fields.taux_amortissement.required(), mode_amortissement: fields.mode_amortissement.required(), duree_utilisation: fields.duree_utilisation.required() }),
  update: Joi.object(fields).min(1),
};
