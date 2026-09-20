const { query } = require("../../config/database");
const reports = {
  ventes: "SELECT * FROM v_ventes_clients ORDER BY date_vente DESC",
  stock: "SELECT * FROM v_stock_matiere ORDER BY designation",
  creances: "SELECT * FROM v_balance_agee_clients ORDER BY jours_retard DESC",
  fournisseurs: "SELECT * FROM v_balance_agee_fournisseurs ORDER BY jours_retard DESC",
  paie: "SELECT * FROM v_paie_personnel ORDER BY agent",
  amortissements: "SELECT * FROM v_plan_amortissement ORDER BY date_calcul DESC",
  bilan: "SELECT * FROM v_bilan",
  resultat: "SELECT * FROM v_compte_resultat",
};
async function get(name) {
  if (!reports[name]) return null;
  return query(reports[name]);
}
module.exports = { get, names: Object.keys(reports) };
