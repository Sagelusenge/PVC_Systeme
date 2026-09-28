const createCrudRepository = require("../../shared/crud.repository");
const { query, withTransaction } = require("../../config/database");
const { recordSale, recordPayment } = require("../../shared/accounting");

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

async function updateWithDetails(id, data) {
  return withTransaction(async (connection) => {
    const current = await base.findById(id, connection);
    if (!current) return null;
    const { details, ...header } = data;
    if (details) {
      header.montant_tot = details.reduce(
        (sum, line) => sum + Number(line.quantite_commandee) * Number(line.prix_vente_unitaire),
        0
      );
    }
    await base.update(id, header, connection);
    if (details) {
      await connection.query("DELETE FROM tdetails_commandeclient WHERE id_commande=?", [id]);
      for (const line of details) {
        await connection.query(
          "INSERT INTO tdetails_commandeclient (id_commande,id_produit_fini,quantite_commandee,prix_vente_unitaire) VALUES (?,?,?,?)",
          [id, line.id_produit_fini, line.quantite_commandee, line.prix_vente_unitaire]
        );
      }
    }
    return id;
  });
}

async function deliver(id, user) {
  return withTransaction(async (connection) => {
    const orders = await connection.query("SELECT * FROM tcommandeclient WHERE id=? FOR UPDATE", [id]);
    const order = orders[0];
    if (!order) return { error: "not_found" };
    if (order.statut === "annulée") return { error: "cancelled" };
    if (order.vente_id) return { error: "already_delivered", saleId: order.vente_id };
    const details = await connection.query(
      "SELECT * FROM tdetails_commandeclient WHERE id_commande=? ORDER BY id_detail_commande", [id]
    );
    if (!details.length) return { error: "empty" };
    for (const line of details) {
      const products = await connection.query("SELECT * FROM tproduitfini WHERE id=? FOR UPDATE", [line.id_produit_fini]);
      const product = products[0];
      if (!product) return { error: "product_not_found" };
      if (Number(product.stock_actuel) < Number(line.quantite_commandee)) {
        return { error: "insufficient", product, available: Number(product.stock_actuel) };
      }
    }
    const total = Number(order.montant_tot);
    const paid = Math.min(Number(order.montant_anticipation || 0), total);
    const saleResult = await connection.query(
      `INSERT INTO tventeproduitfini
        (date_vente,client_id,montant_total_vente,montant_payee,type_paiement,etat_paiement)
       VALUES (?,?,?,?,?,?)`,
      [new Date(), order.client_id, total, paid, paid > 0 ? "ANTICIPATION" : "CREDIT", paid >= total ? "payé" : "non payé"]
    );
    const saleId = saleResult.insertId;
    for (const line of details) {
      await connection.query(
        "INSERT INTO tdetails_vente (id_vente,id_produit_fini,quantite_vendue,prix_vente_unitaire_reel) VALUES (?,?,?,?)",
        [saleId, line.id_produit_fini, line.quantite_commandee, line.prix_vente_unitaire]
      );
      await connection.query("UPDATE tproduitfini SET stock_actuel=stock_actuel-? WHERE id=?", [line.quantite_commandee, line.id_produit_fini]);
    }
    await connection.query("UPDATE tclient SET solde_compte=solde_compte+? WHERE id=?", [total - paid, order.client_id]);
    await recordSale(connection, { saleId, amount: total, date: new Date(), user });
    let paymentId = null;
    if (paid > 0) {
      const payment = await connection.query(
        `INSERT INTO tpaiements_clients
          (id_client,id_vente,date_paiement,libelle,montant_paye,um,type_paiement,statut_paiement)
         VALUES (?,?,?,?,?,'USD','Anticipation',?)`,
        [order.client_id, saleId, order.date_paiement_anticipation || new Date(), `Acompte commande ${order.numero}`, paid, paid >= total ? "Réglé" : "Partiel"]
      );
      paymentId = payment.insertId;
      await recordPayment(connection, { paymentId, amount: paid, date: order.date_paiement_anticipation || new Date(), user, cash: false });
    }
    await connection.query("UPDATE tcommandeclient SET statut='livrée', vente_id=? WHERE id=?", [saleId, id]);
    return { saleId, paymentId };
  });
}

async function remove(id) {
  return withTransaction(async (connection) => {
    await connection.query("DELETE FROM tdetails_commandeclient WHERE id_commande = ?", [id]);
    return base.remove(id, connection);
  });
}

module.exports = { ...base, findDetailed, createWithDetails, updateWithDetails, deliver, remove };
