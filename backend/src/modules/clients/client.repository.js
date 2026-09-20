const createCrudRepository = require("../../shared/crud.repository");
const { query } = require("../../config/database");

const repository = createCrudRepository({
  table: "tclient",
  columns: ["code", "raison_sociale", "adresse", "conditions_paiement", "solde_compte"],
  searchColumns: ["code", "raison_sociale", "adresse"],
});

repository.history = async (id) => {
  const ventes = await query("SELECT * FROM v_ventes_clients WHERE id_vente IN (SELECT id FROM tventeproduitfini WHERE client_id = ?) ORDER BY date_vente DESC", [id]);
  const paiements = await query("SELECT * FROM tpaiements_clients WHERE id_client = ? ORDER BY date_paiement DESC", [id]);
  return { ventes, paiements };
};

module.exports = repository;
