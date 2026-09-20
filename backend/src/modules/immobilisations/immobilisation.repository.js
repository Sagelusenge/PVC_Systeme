const createCrudRepository = require("../../shared/crud.repository");
const { query } = require("../../config/database");

const materials = createCrudRepository({
  table: "tmateriels", idColumn: "id_materiel",
  columns: ["code_materiel", "designation", "date_acquisition", "valeur_acquisition", "amortissable", "taux_amortissement", "mode_amortissement", "periodicite", "duree_utilisation", "valeur_residuelle", "provenance", "statut", "Coefficient_degressif"],
  searchColumns: ["code_materiel", "designation", "provenance"], defaultOrder: "id_materiel",
});
async function plan(id) { return query("SELECT * FROM v_plan_amortissement WHERE id_materiel=? ORDER BY date_calcul", [id]); }
async function allPlans() { return query("SELECT * FROM v_plan_amortissement ORDER BY date_calcul DESC"); }
module.exports = { materials, plan, allPlans };
