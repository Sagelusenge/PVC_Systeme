const createCrudRepository = require("../../shared/crud.repository");
const { query } = require("../../config/database");

const resources = {
  comptes: createCrudRepository({ table: "tcomptes", columns: ["numero", "intitule", "masse_bilantaire", "id_naturecompte"], searchColumns: ["numero", "intitule"] }),
  sousComptes: createCrudRepository({ table: "tsous_comptes", columns: ["numero", "intitule", "compte_id"], searchColumns: ["numero", "intitule"] }),
  journaux: createCrudRepository({ table: "tjournal", columns: ["codejr", "nom_journal"], searchColumns: ["codejr", "nom_journal"] }),
  ecritures: createCrudRepository({ table: "tecritures_comptables", columns: ["journal_id", "numdocument", "sous_compte_id", "sens", "libelle", "sous_compte_cp", "date_ecriture", "montant", "um", "taux_convertion_usd_fc", "id_user"], searchColumns: ["numdocument", "libelle"], defaultOrder: "date_ecriture" }),
};

const allowedViews = new Set(["v_journal_operations", "v_balance_generale", "v_balance_comptes", "v_bilan", "v_compte_resultat", "v_synthese_financiere", "v_resultat_net"]);
async function report(view) {
  if (!allowedViews.has(view)) throw new Error("Vue comptable non autorisee");
  return query(`SELECT * FROM \`${view}\``);
}
async function references() {
  const [natures, masses] = await Promise.all([query("SELECT * FROM tnature_compte ORDER BY id_nature"), query("SELECT * FROM tmasse_bilantaire ORDER BY id")]);
  return { natures, masses };
}

async function getExchangeRate() {
  const rows = await query("SELECT valeur, date_modification FROM tparametres_application WHERE cle='taux_usd_fc' LIMIT 1");
  return { taux: Number(rows[0]?.valeur || 2850), date_modification: rows[0]?.date_modification || null };
}

async function updateExchangeRate(rate) {
  await query(
    "INSERT INTO tparametres_application (cle,valeur,description) VALUES ('taux_usd_fc',?,'Taux de conversion de reference USD vers FC') ON DUPLICATE KEY UPDATE valeur=VALUES(valeur)",
    [String(rate)]
  );
  return getExchangeRate();
}

module.exports = { ...resources, report, references, getExchangeRate, updateExchangeRate };
