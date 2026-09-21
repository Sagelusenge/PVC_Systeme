const createCrudRepository = require("../../shared/crud.repository");
const { query, withTransaction } = require("../../config/database");
const { getPagination } = require("../../utils/pagination");

const make = (table, columns, searchColumns = []) => createCrudRepository({ table, columns, searchColumns });
const presences = make("tpresences", ["id_agent", "heure_arrivee", "heure_sortie", "est_ferie"]);
presences.list = async (params = {}) => {
  const { page, limit, offset } = getPagination(params);
  const totals = await query("SELECT COUNT(*) total FROM tpresences");
  const rows = await query(
    `SELECT p.*, CONCAT_WS(' ', a.nom, a.postnom, a.prenom) agent
     FROM tpresences p JOIN tpersonnel a ON a.id = p.id_agent
     ORDER BY p.heure_arrivee DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return { rows, total: totals[0].total, page, limit };
};

const payrollPayments = make(
  "tpaies_salaires",
  ["id_agent", "periode", "date_paiement", "montant_base", "avantages", "retenues", "montant_net", "montant_paye", "devise", "mode_paiement", "reference_paiement", "statut"]
);
payrollPayments.list = async (params = {}) => {
  const { page, limit, offset } = getPagination(params);
  const totals = await query("SELECT COUNT(*) total FROM tpaies_salaires");
  const rows = await query(
    `SELECT p.*, CONCAT_WS(' ', a.nom, a.postnom, a.prenom) agent
     FROM tpaies_salaires p JOIN tpersonnel a ON a.id = p.id_agent
     ORDER BY p.periode DESC, p.date_paiement DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return { rows, total: totals[0].total, page, limit };
};

async function payroll() {
  return query(
    `SELECT v.*,
       COALESCE((SELECT SUM(aa.montant) FROM taffect_avantages aa WHERE aa.id_agent = v.id_agent), 0) avantages,
       COALESCE((SELECT SUM(ar.montant) FROM tagent_retenues ar WHERE ar.id_agent = v.id_agent), 0) retenues,
       COALESCE(v.salaire_mensuel, 0)
         + COALESCE((SELECT SUM(aa.montant) FROM taffect_avantages aa WHERE aa.id_agent = v.id_agent), 0)
         - COALESCE((SELECT SUM(ar.montant) FROM tagent_retenues ar WHERE ar.id_agent = v.id_agent), 0) montant_net
     FROM v_paie_personnel v ORDER BY v.agent`
  );
}

async function createPayroll(data) {
  return withTransaction(async (connection) => {
    const rows = await connection.query(
      `SELECT v.*,
         COALESCE((SELECT SUM(aa.montant) FROM taffect_avantages aa WHERE aa.id_agent = v.id_agent), 0) avantages,
         COALESCE((SELECT SUM(ar.montant) FROM tagent_retenues ar WHERE ar.id_agent = v.id_agent), 0) retenues
       FROM v_paie_personnel v WHERE v.id_agent = ? LIMIT 1`,
      [data.id_agent]
    );
    const agent = rows[0];
    if (!agent) return null;
    const base = Number(agent.salaire_mensuel || 0);
    const avantages = Number(agent.avantages || 0);
    const retenues = Number(agent.retenues || 0);
    const net = Math.max(0, base + avantages - retenues);
    const paid = data.montant_paye === undefined ? net : Number(data.montant_paye);
    const status = paid >= net ? "Paye" : "Partiel";
    const result = await connection.query(
      `INSERT INTO tpaies_salaires
       (id_agent, periode, date_paiement, montant_base, avantages, retenues, montant_net, montant_paye, devise, mode_paiement, reference_paiement, statut)
       VALUES (?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.id_agent, data.periode, data.date_paiement || null, base, avantages, retenues, net, paid, data.devise || "USD", data.mode_paiement || "Banque", data.reference_paiement || null, status]
    );
    return payrollPayments.findById(result.insertId, connection);
  });
}

module.exports = {
  personnel: make("tpersonnel", ["nom", "postnom", "prenom", "numtelephon", "adresse", "statut"], ["nom", "postnom", "prenom", "numtelephon"]),
  postes: make("tpostes", ["nom_poste", "salaire_mensuel"], ["nom_poste"]),
  affectations: make("taffectations_personnel", ["id_perso", "poste_id", "date_affectation"]),
  presences,
  conges: make("tconges", ["libelle", "jours_max"], ["libelle"]),
  demandesConges: make("tprendre_conges", ["id_agent", "idconge", "date_debut", "date_fin", "statut"]),
  retenues: make("tretenues_salaire", ["libelle"], ["libelle"]),
  agentRetenues: make("tagent_retenues", ["id_agent", "id_retenue", "montant"]),
  avantages: make("tavantages_salaire", ["libelle"], ["libelle"]),
  agentAvantages: make("taffect_avantages", ["id_agent", "id_avantage", "montant"]),
  joursFeries: make("tjours_feries", ["date_ferie", "description"], ["description"]),
  payroll,
  payrollPayments,
  createPayroll,
};
