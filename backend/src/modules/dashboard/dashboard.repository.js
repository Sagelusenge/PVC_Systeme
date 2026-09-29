const { query } = require("../../config/database");

async function overview() {
  const [sales, receivables, stockAlerts, products, personnel, recentSales, clients, orders, payments, materials, production, accounting, assets, users, presences, payroll, purchases] = await Promise.all([
    query("SELECT COUNT(*) nombre, COALESCE(SUM(montant_total_vente),0) chiffre_affaires FROM tventeproduitfini WHERE date_vente >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
    query("SELECT COALESCE(SUM(solde_du),0) total FROM v_balance_agee_clients"),
    query("SELECT COUNT(*) nombre FROM tmatierepremiere WHERE stock_actuel <= seuil_reappro"),
    query("SELECT COUNT(*) nombre, COALESCE(SUM(stock_actuel * prix_unitaire),0) valeur FROM tproduitfini"),
    query("SELECT COUNT(*) nombre FROM tpersonnel WHERE statut=1"),
    query("SELECT * FROM v_ventes_clients ORDER BY date_vente DESC LIMIT 5"),
    query("SELECT COUNT(*) nombre FROM tclient"),
    query("SELECT COUNT(*) nombre, COALESCE(SUM(montant_tot),0) montant FROM tcommandeclient WHERE statut='en attente'"),
    query("SELECT COUNT(*) nombre, COALESCE(SUM(montant_paye),0) montant FROM tpaiements_clients WHERE statut_paiement<>'Annulé' AND date_paiement >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
    query("SELECT COUNT(*) nombre, COALESCE(SUM(stock_actuel * cmup),0) valeur FROM tmatierepremiere"),
    query("SELECT COUNT(*) nombre, COALESCE(SUM(quantite_entree),0) quantite FROM tentrees_pf WHERE date_entree >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
    query("SELECT COALESCE(SUM(CASE WHEN sens='CP' THEN montant ELSE 0 END),0) debit, COALESCE(SUM(CASE WHEN sens='C' THEN montant ELSE 0 END),0) credit FROM tecritures_comptables WHERE date_ecriture >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
    query("SELECT COUNT(*) nombre, COALESCE(SUM(valeur_acquisition),0) valeur FROM tmateriels WHERE statut<>'vendu'"),
    query("SELECT COUNT(*) nombre FROM tutilisateurs WHERE statut='Actif'"),
    query("SELECT COUNT(DISTINCT id_agent) nombre FROM tpresences WHERE DATE(heure_arrivee)=CURDATE()"),
    query("SELECT COUNT(*) nombre, COALESCE(SUM(montant_paye),0) montant FROM tpaies_salaires WHERE periode=DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
    query("SELECT COUNT(*) nombre, COALESCE(SUM(quantite * prix_unitaire_entree),0) montant FROM tentreematiere WHERE date_entree >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"),
  ]);
  return {
    ventes_mois: sales[0], creances_clients: receivables[0].total, alertes_stock: stockAlerts[0].nombre,
    produits_finis: products[0], personnel_actif: personnel[0].nombre, ventes_recentes: recentSales,
    clients: clients[0], commandes_attente: orders[0], paiements_mois: payments[0], matieres: materials[0],
    production_mois: production[0], comptabilite_mois: accounting[0], immobilisations: assets[0],
    utilisateurs_actifs: users[0].nombre, presences_jour: presences[0].nombre, paies_mois: payroll[0], achats_mois: purchases[0],
  };
}
module.exports = { overview };
