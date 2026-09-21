const Joi = require("joi");
const id = Joi.number().integer().positive();
const amount = Joi.number().min(0).precision(2);
const schemas = {
  personnel: { nom: Joi.string().max(100).allow(null, ""), postnom: Joi.string().max(100).allow(null, ""), prenom: Joi.string().max(100).allow(null, ""), numtelephon: Joi.string().max(13).allow(null, ""), adresse: Joi.string().max(100).allow(null, ""), statut: Joi.boolean() },
  postes: { nom_poste: Joi.string().max(100), salaire_mensuel: amount },
  affectations: { id_perso: id, poste_id: id, date_affectation: Joi.date().iso() },
  presences: { id_agent: id, heure_arrivee: Joi.date().iso(), heure_sortie: Joi.date().iso().allow(null), est_ferie: Joi.boolean() },
  conges: { libelle: Joi.string().max(100), jours_max: Joi.number().integer().min(0) },
  demandesConges: { id_agent: id, idconge: id, date_debut: Joi.date().iso(), date_fin: Joi.date().iso(), statut: Joi.string().valid("en_attente", "approuve", "rejete") },
  retenues: { libelle: Joi.string().max(100) }, agentRetenues: { id_agent: id, id_retenue: id, montant: amount },
  avantages: { libelle: Joi.string().max(100) }, agentAvantages: { id_agent: id, id_avantage: id, montant: amount },
  joursFeries: { date_ferie: Joi.date().iso(), description: Joi.string().max(100) },
  payrollPayments: { montant_paye: amount, mode_paiement: Joi.string().valid("Especes", "Banque", "Mobile Money"), reference_paiement: Joi.string().max(100).allow(null, ""), statut: Joi.string().valid("Paye", "Partiel", "Annule") },
};
const createPayroll = Joi.object({
  id_agent: id.required(),
  periode: Joi.date().iso().required(),
  date_paiement: Joi.date().iso().allow(null),
  montant_paye: amount,
  devise: Joi.string().valid("USD", "CDF").default("USD"),
  mode_paiement: Joi.string().valid("Especes", "Banque", "Mobile Money").default("Banque"),
  reference_paiement: Joi.string().max(100).allow(null, ""),
});
function create(name, required) { let schema = Joi.object(schemas[name]); for (const field of required) schema = schema.fork(field, (value) => value.required()); return schema; }
function update(name) { return Joi.object(schemas[name]).min(1); }
module.exports = { schemas, create, update, createPayroll };
