const createCrudRepository = require("../../shared/crud.repository");
const { withTransaction } = require("../../config/database");
const { recordPayment } = require("../../shared/accounting");

const base = createCrudRepository({
  table: "tpaiements_clients", idColumn: "id_paiement",
  columns: ["id_client", "id_vente", "date_paiement", "libelle", "montant_paye", "um", "type_paiement", "statut_paiement"],
  searchColumns: ["libelle"], defaultOrder: "id_paiement",
});

async function createPayment(data) {
  return withTransaction(async (connection) => {
    const { _id_user: user, ...paymentData } = data;
    const sales = await connection.query("SELECT * FROM tventeproduitfini WHERE id=? FOR UPDATE", [paymentData.id_vente]);
    const sale = sales[0];
    if (!sale) return { error: "sale_not_found" };
    if (Number(sale.client_id) !== Number(paymentData.id_client)) return { error: "client_mismatch" };
    const remaining = Number(sale.montant_total_vente) - Number(sale.montant_payee);
    if (Number(paymentData.montant_paye) > remaining) return { error: "overpayment", remaining };
    const payment = await base.create({ ...paymentData, statut_paiement: Number(paymentData.montant_paye) >= remaining ? "Réglé" : "Partiel" }, connection);
    const newPaid = Number(sale.montant_payee) + Number(paymentData.montant_paye);
    await connection.query("UPDATE tventeproduitfini SET montant_payee=?, etat_paiement=? WHERE id=?", [newPaid, newPaid >= Number(sale.montant_total_vente) ? "payé" : "non payé", sale.id]);
    await connection.query("UPDATE tclient SET solde_compte=GREATEST(solde_compte-?,0) WHERE id=?", [paymentData.montant_paye, paymentData.id_client]);
    await recordPayment(connection, {
      paymentId: payment.id_paiement, amount: paymentData.montant_paye, date: paymentData.date_paiement,
      user, cash: paymentData.type_paiement === "Comptant",
    });
    return { payment };
  });
}

async function cancelPayment(id, user) {
  return withTransaction(async (connection) => {
    const rows = await connection.query("SELECT * FROM tpaiements_clients WHERE id_paiement=? FOR UPDATE", [id]);
    const payment = rows[0];
    if (!payment) return { error: "not_found" };
    if (payment.statut_paiement === "Annulé") return { payment };
    await connection.query("UPDATE tpaiements_clients SET statut_paiement='Annulé' WHERE id_paiement=?", [id]);
    await connection.query("UPDATE tventeproduitfini SET montant_payee=GREATEST(montant_payee-?,0), etat_paiement='non payé' WHERE id=?", [payment.montant_paye, payment.id_vente]);
    await connection.query("UPDATE tclient SET solde_compte=solde_compte+? WHERE id=?", [payment.montant_paye, payment.id_client]);
    await connection.query(
      "UPDATE tcommandeclient SET montant_anticipation=0, date_paiement_anticipation=NULL WHERE vente_id=? AND montant_anticipation=?",
      [payment.id_vente, payment.montant_paye]
    );
    await recordPayment(connection, {
      paymentId: payment.id_paiement, amount: payment.montant_paye, date: new Date(), user,
      cash: payment.type_paiement === "Comptant", reversal: true,
    });
    return { payment: await base.findById(id, connection) };
  });
}

module.exports = { ...base, createPayment, cancelPayment };
