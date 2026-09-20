const createCrudRepository = require("../../shared/crud.repository");
const { query, withTransaction } = require("../../config/database");

const base = createCrudRepository({
  table: "tcommandeclient",
  columns: ["numero", "date_commande", "client_id", "date_livraison_prevue", "statut", "montant_tot", "montant_anticipation", "date_paiement_anticipation"],
  searchColumns: ["numero"],
});

async function findDetailed(id) {
  const orders = await query(
    `SELECT c.*, cl.raison_sociale AS client FROM tcommandeclient c
     LEFT JOIN tclient cl ON cl.id = c.client_id WHERE c.id = ?`, [id]
  );
  if (!orders[0]) return null;
  orders[0].details = await query(
    `SELECT d.*, p.code, p.libelle FROM tdetails_commandeclient d
     JOIN tproduitfini p ON p.id = d.id_produit_fini WHERE d.id_commande = ?`, [id]
  );
  return orders[0];
}

async function createWithDetails(data) {
  return withTransaction(async (connection) => {
    const total = data.details.reduce((sum, line) => sum + Number(line.quantite_commandee) * Number(line.prix_vente_unitaire), 0);
    const order = await base.create({ ...data, montant_tot: total, details: undefined }, connection);
    for (const line of data.details) {
      await connection.query(
        "INSERT INTO tdetails_commandeclient (id_commande, id_produit_fini, quantite_commandee, prix_vente_unitaire) VALUES (?, ?, ?, ?)",
        [order.id, line.id_produit_fini, line.quantite_commandee, line.prix_vente_unitaire]
      );
    }
    return order.id;
  });
}

module.exports = { ...base, findDetailed, createWithDetails };
