const Joi = require("joi");

const materialFields = {
  reference: Joi.string().trim().max(50), designation: Joi.string().trim().max(100),
  unite_mesure: Joi.string().valid("PIECE", "KG", "Litre", "Sac", "Boite", "Carton"),
  stock_actuel: Joi.number().min(0).precision(2), cmup: Joi.number().min(0).precision(2), seuil_reappro: Joi.number().min(0).precision(2),
};
const buyerFields = {
  code: Joi.string().trim().max(50), nom: Joi.string().trim().max(100), postnom: Joi.string().trim().max(100), prenom: Joi.string().trim().max(100),
  adresse: Joi.string().trim().max(255).allow(null, ""), tel: Joi.string().trim().max(20).allow(null, ""), email: Joi.string().email().max(100).allow(null, ""), solde_compte: Joi.number().precision(2),
};

module.exports = {
  createMaterial: Joi.object({ ...materialFields, reference: materialFields.reference.required(), designation: materialFields.designation.required() }),
  updateMaterial: Joi.object(materialFields).min(1),
  createBuyer: Joi.object({ ...buyerFields, code: buyerFields.code.required(), nom: buyerFields.nom.required(), postnom: buyerFields.postnom.required(), prenom: buyerFields.prenom.required() }),
  updateBuyer: Joi.object(buyerFields).min(1),
  createEntry: Joi.object({ date_entree: Joi.date().iso().required(), matiere_premiere_id: Joi.number().integer().positive().required(), agent_achat_id: Joi.number().integer().positive().allow(null), quantite: Joi.number().positive().required(), unite: Joi.string().max(20), prix_unitaire_entree: Joi.number().min(0).required(), montant_payer: Joi.number().min(0).required() }),
  createExit: Joi.object({ date_sortie: Joi.date().iso().required(), matiere_premiere_id: Joi.number().integer().positive().required(), quantite: Joi.number().positive().required(), unite: Joi.string().max(20), cout_unitaire: Joi.number().min(0) }),
};
