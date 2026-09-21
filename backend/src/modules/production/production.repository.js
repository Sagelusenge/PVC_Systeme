const createCrudRepository = require("../../shared/crud.repository");
const { query, withTransaction } = require("../../config/database");

const products = createCrudRepository({
  table: "tproduitfini",
  columns: ["code", "libelle", "unite", "prix_unitaire", "stock_actuel"],
  searchColumns: ["code", "libelle"],
});
const entries = createCrudRepository({
  table: "tentrees_pf",
  columns: ["id_produit_fini", "quantite_entree", "unite_mesure", "date_entree", "cout_production_unitaire"],
  searchColumns: [],
});

async function createEntry(data) {
  return withTransaction(async (connection) => {
    const product = await products.findById(data.id_produit_fini, connection);
    if (!product) return null;
    const entry = await entries.create(data, connection);
    await connection.query("UPDATE tproduitfini SET stock_actuel = stock_actuel + ? WHERE id = ?", [data.quantite_entree, data.id_produit_fini]);
    return entry;
  });
}

async function nextProductCode() {
  const rows = await query("SELECT code FROM tproduitfini");
  const highest = rows.reduce((max, row) => {
    const match = String(row.code || "").match(/^PF-(\d+)$/i);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `PF-${String(highest + 1).padStart(4, "0")}`;
}

module.exports = { products, entries, createEntry, nextProductCode };
