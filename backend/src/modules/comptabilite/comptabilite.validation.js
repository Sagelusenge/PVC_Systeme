const Joi = require("joi");
const compte = { numero: Joi.string().max(6), intitule: Joi.string().max(100), masse_bilantaire: Joi.number().integer().positive().allow(null), id_naturecompte: Joi.number().integer().positive() };
const sousCompte = { numero: Joi.string().max(15), intitule: Joi.string().max(200), compte_id: Joi.number().integer().positive().allow(null) };
const journal = { codejr: Joi.string().max(5), nom_journal: Joi.string().max(50) };
const ecriture = { journal_id: Joi.number().integer().positive(), numdocument: Joi.string().max(10), sous_compte_id: Joi.number().integer().positive(), sens: Joi.string().valid("C", "CP"), libelle: Joi.string().allow(null, ""), sous_compte_cp: Joi.number().integer().positive().allow(null), date_ecriture: Joi.date().iso(), montant: Joi.number().positive(), um: Joi.string().valid("USD", "FC"), taux_convertion_usd_fc: Joi.number().positive() };
const ecriturePaire = {
  journal_id: Joi.number().integer().positive().required(),
  numdocument: Joi.string().trim().max(10).required(),
  debit_sous_compte_id: Joi.number().integer().positive().required(),
  credit_sous_compte_id: Joi.number().integer().positive().invalid(Joi.ref("debit_sous_compte_id")).required().messages({ "any.invalid": "Les comptes debit et credit doivent etre differents" }),
  libelle: Joi.string().trim().max(255).required(),
  date_ecriture: Joi.date().iso().required(),
  montant: Joi.number().positive().precision(2).required(),
  um: Joi.string().valid("USD", "FC").required(),
  taux_convertion_usd_fc: Joi.number().positive().required(),
};
module.exports = {
  createCompte: Joi.object({ ...compte, numero: compte.numero.required(), intitule: compte.intitule.required(), id_naturecompte: compte.id_naturecompte.required() }), updateCompte: Joi.object(compte).min(1),
  createSousCompte: Joi.object({ ...sousCompte, numero: sousCompte.numero.required(), intitule: sousCompte.intitule.required() }), updateSousCompte: Joi.object(sousCompte).min(1),
  createJournal: Joi.object({ codejr: journal.codejr.required(), nom_journal: journal.nom_journal.required() }), updateJournal: Joi.object(journal).min(1),
  createEcriture: Joi.object(ecriturePaire), updateEcriture: Joi.object(ecriture).min(1),
  updateExchangeRate: Joi.object({ taux: Joi.number().positive().max(1000000).required() }),
};
