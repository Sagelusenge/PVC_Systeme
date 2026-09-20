const createCrudRepository = require("../../shared/crud.repository");
const { query, withTransaction } = require("../../config/database");

const base = createCrudRepository({
  table: "tventeproduitfini",
  columns: ["date_vente", "client_id", "montant_total_vente", "montant_payee", "type_paiement", "etat_paiement"],
});

async function findDetailed(id) {
  const rows = await query(`SELECT v.*, c.raison_sociale client FROM tventeproduitfini v LEFT JOIN tclient c ON c.id=v.client_id WHERE v.id=?`, [id]);
  if (!rows[0]) return null;
  rows[0].details = await query(`SELECT d.*, p.code, p.libelle FROM tdetails_vente d JOIN tproduitfini p ON p.id=d.id_produit_fini WHERE d.id_vente=?`, [id]);
  rows[0].paiements = await query("SELECT * FROM tpaiements_clients WHERE id_vente=? ORDER BY date_paiement DESC", [id]);
  return rows[0];
}

async function createWithDetails(data) {
  return withTransaction(async (connection) => {
    let total = 0;
    for (const line of data.details) {
      const products = await connection.query("SELECT * FROM tproduitfini WHERE id=? FOR UPDATE", [line.id_produit_fini]);
      const product = products[0];
      if (!product) return { error: "not_found", productId: line.id_produit_fini };
      if (Number(product.stock_actuel) < Number(line.quantite_vendue)) return { error: "insufficient", product, requested: line.quantite_vendue };
      total += Number(line.quantite_vendue) * Number(line.prix_vente_unitaire_reel);
    }

    const paid = Number(data.montant_payee || 0);
    if (paid > total) return { error: "overpayment", total };
    const sale = await base.create({
      ...data, details: undefined, montant_total_vente: total, montant_payee: paid,
      etat_paiement: paid >= total ? "payé" : "non payé",
    }, connection);
    for (const line of data.details) {
      await connection.query("INSERT INTO tdetails_vente (id_vente,id_produit_fini,quantite_vendue,prix_vente_unitaire_reel) VALUES (?,?,?,?)", [sale.id, line.id_produit_fini, line.quantite_vendue, line.prix_vente_unitaire_reel]);
      await connection.query("UPDATE tproduitfini SET stock_actuel=stock_actuel-? WHERE id=?", [line.quantite_vendue, line.id_produit_fini]);
    }
    await connection.query("UPDATE tclient SET solde_compte=solde_compte+? WHERE id=?", [total - paid, data.client_id]);
    return { id: sale.id };
  });
}

module.exports = { ...base, findDetailed, createWithDetails };
