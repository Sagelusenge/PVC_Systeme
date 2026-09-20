const createCrudRepository = require("../../shared/crud.repository");
const { query } = require("../../config/database");

const make = (table, columns, searchColumns = []) => createCrudRepository({ table, columns, searchColumns });
module.exports = {
  personnel: make("tpersonnel", ["nom", "postnom", "prenom", "numtelephon", "adresse", "statut"], ["nom", "postnom", "prenom", "numtelephon"]),
  postes: make("tpostes", ["nom_poste", "salaire_mensuel"], ["nom_poste"]),
  affectations: make("taffectations_personnel", ["id_perso", "poste_id", "date_affectation"]),
  presences: make("tpresences", ["id_agent", "heure_arrivee", "heure_sortie", "est_ferie"]),
  conges: make("tconges", ["libelle", "jours_max"], ["libelle"]),
  demandesConges: make("tprendre_conges", ["id_agent", "idconge", "date_debut", "date_fin", "statut"]),
  retenues: make("tretenues_salaire", ["libelle"], ["libelle"]),
  agentRetenues: make("tagent_retenues", ["id_agent", "id_retenue", "montant"]),
  avantages: make("tavantages_salaire", ["libelle"], ["libelle"]),
  agentAvantages: make("taffect_avantages", ["id_agent", "id_avantage", "montant"]),
  joursFeries: make("tjours_feries", ["date_ferie", "description"], ["description"]),
  payroll: () => query("SELECT * FROM v_paie_personnel ORDER BY agent"),
};
