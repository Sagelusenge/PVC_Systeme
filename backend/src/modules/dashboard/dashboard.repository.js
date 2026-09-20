const { query } = require("../../config/database");

async function overview() {
  const [sales, receivables, stockAlerts, products, personnel, recentSales] = await Promise.all([
    query("SELECT COUNT(*) nombre, COALESCE(SUM(montant_total_vente),0) chiffre_affaires FROM tventeproduitfini WHERE date_vente >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
    query("SELECT COALESCE(SUM(solde_du),0) total FROM v_balance_agee_clients"),
    query("SELECT COUNT(*) nombre FROM tmatierepremiere WHERE stock_actuel <= seuil_reappro"),
    query("SELECT COUNT(*) nombre, COALESCE(SUM(stock_actuel * prix_unitaire),0) valeur FROM tproduitfini"),
    query("SELECT COUNT(*) nombre FROM tpersonnel WHERE statut=1"),
    query("SELECT * FROM v_ventes_clients ORDER BY date_vente DESC LIMIT 5"),
  ]);
  return { ventes_mois: sales[0], creances_clients: receivables[0].total, alertes_stock: stockAlerts[0].nombre, produits_finis: products[0], personnel_actif: personnel[0].nombre, ventes_recentes: recentSales };
}
module.exports = { overview };
