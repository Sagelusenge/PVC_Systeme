const createCrudRepository = require("../../shared/crud.repository");
const { query, withTransaction } = require("../../config/database");

const materials = createCrudRepository({
  table: "tmatierepremiere",
  columns: ["reference", "designation", "unite_mesure", "stock_actuel", "cmup", "seuil_reappro"],
  searchColumns: ["reference", "designation"],
});
const buyers = createCrudRepository({
  table: "tagent_achat",
  columns: ["code", "nom", "postnom", "prenom", "adresse", "tel", "email", "solde_compte"],
  searchColumns: ["code", "nom", "postnom", "prenom", "email"],
});
const entries = createCrudRepository({
  table: "tentreematiere",
  columns: ["date_entree", "matiere_premiere_id", "agent_achat_id", "quantite", "unite", "prix_unitaire_entree", "montant_payer"],
});
const exits = createCrudRepository({
  table: "tsortiematiere",
  columns: ["date_sortie", "matiere_premiere_id", "quantite", "unite", "cout_unitaire"],
});

async function createEntry(data) {
  return withTransaction(async (connection) => {
    const rows = await connection.query("SELECT * FROM tmatierepremiere WHERE id = ? FOR UPDATE", [data.matiere_premiere_id]);
    const material = rows[0];
    if (!material) return null;
    const oldStock = Number(material.stock_actuel || 0);
    const quantity = Number(data.quantite);
    const newStock = oldStock + quantity;
    const cmup = newStock > 0
      ? ((oldStock * Number(material.cmup || 0)) + (quantity * Number(data.prix_unitaire_entree))) / newStock
      : 0;
    const entry = await entries.create(data, connection);
    await connection.query("UPDATE tmatierepremiere SET stock_actuel = ?, cmup = ? WHERE id = ?", [newStock, cmup, material.id]);
    return entry;
  });
}

async function createExit(data) {
  return withTransaction(async (connection) => {
    const rows = await connection.query("SELECT * FROM tmatierepremiere WHERE id = ? FOR UPDATE", [data.matiere_premiere_id]);
    const material = rows[0];
    if (!material) return { error: "not_found" };
    if (Number(material.stock_actuel) < Number(data.quantite)) return { error: "insufficient", available: Number(material.stock_actuel) };
    const payload = { ...data, cout_unitaire: data.cout_unitaire ?? material.cmup };
    const exit = await exits.create(payload, connection);
    await connection.query("UPDATE tmatierepremiere SET stock_actuel = stock_actuel - ? WHERE id = ?", [data.quantite, material.id]);
    return { exit };
  });
}

async function movements(params = {}) {
  const materialId = params.matiere_premiere_id || null;
  return query(
    `SELECT 'entree' type_mouvement, id, date_entree date_mouvement, matiere_premiere_id, quantite, unite, prix_unitaire_entree cout_unitaire
     FROM tentreematiere WHERE (? IS NULL OR matiere_premiere_id = ?)
     UNION ALL
     SELECT 'sortie', id, date_sortie, matiere_premiere_id, quantite, unite, cout_unitaire
     FROM tsortiematiere WHERE (? IS NULL OR matiere_premiere_id = ?)
     ORDER BY date_mouvement DESC`,
    [materialId, materialId, materialId, materialId]
  );
}

async function alerts() {
  return query("SELECT * FROM tmatierepremiere WHERE stock_actuel <= seuil_reappro ORDER BY stock_actuel ASC");
}

module.exports = { materials, buyers, entries, exits, createEntry, createExit, movements, alerts };
