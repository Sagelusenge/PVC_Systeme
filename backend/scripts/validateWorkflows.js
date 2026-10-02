const assert = require("node:assert/strict");

const API_URL = (process.env.QA_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const USERNAME = process.env.QA_ADMIN_USER || "sagelusenge@gmail.com";
const PASSWORD = process.env.QA_PASSWORD || "password";

async function request(path, token, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status} - ${payload?.message || "reponse invalide"}`);
  return payload?.data;
}

function requireRows(name, rows) {
  assert.ok(Array.isArray(rows), `${name}: liste attendue`);
  assert.ok(rows.length > 0, `${name}: aucune donnee`);
  console.log(`OK  ${name}: ${rows.length} ligne(s) controlee(s)`);
}

function money(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

(async () => {
  console.log(`Validation des parcours sur ${API_URL}`);
  const login = await request("/auth/login", null, {
    method: "POST",
    body: JSON.stringify({ nom_utilisateur: USERNAME, mot_de_passe: PASSWORD }),
  });
  const token = login.token;

  const [clients, orders, sales, payments, products, materials, personnel, payroll, assets, journal] = await Promise.all([
    request("/clients?limit=100", token),
    request("/commandes?limit=100", token),
    request("/ventes?limit=100", token),
    request("/paiements?limit=100", token),
    request("/production/produits?limit=100", token),
    request("/stock/matieres?limit=100", token),
    request("/rh/personnel?limit=100", token),
    request("/rh/paie-paiements?limit=100", token),
    request("/immobilisations/materiels?limit=100", token),
    request("/comptabilite/journal-operations", token),
  ]);

  for (const [name, rows] of Object.entries({ clients, commandes: orders, ventes: sales, paiements: payments, produits: products, matieres: materials, personnel, paie: payroll, immobilisations: assets, journal })) {
    requireRows(name, rows);
  }

  const delivered = orders.find((order) => order.vente_id && order.statut === "livrée");
  assert.ok(delivered, "commande facturee introuvable");
  const [order, sale] = await Promise.all([
    request(`/commandes/${delivered.id}`, token),
    request(`/ventes/${delivered.vente_id}`, token),
  ]);
  assert.equal(Number(sale.client_id), Number(order.client_id), "client commande/vente different");
  assert.equal(money(sale.montant_total_vente), money(order.montant_tot), "total commande/vente different");
  assert.equal(sale.details.length, order.details.length, "nombre de produits commande/vente different");
  for (const line of order.details) {
    const billed = sale.details.find((item) => Number(item.id_produit_fini) === Number(line.id_produit_fini));
    assert.ok(billed, `produit ${line.id_produit_fini} absent de la facture`);
    assert.equal(Number(billed.quantite_vendue), Number(line.quantite_commandee));
    assert.equal(money(billed.prix_vente_unitaire_reel), money(line.prix_vente_unitaire));
  }
  console.log(`OK  commande ${order.numero} -> vente ${sale.id}: produits, quantites et total identiques`);

  const payment = payments.find((item) => item.id_vente && item.statut_paiement !== "Annulé");
  assert.ok(payment, "paiement client actif introuvable");
  const paidSale = await request(`/ventes/${payment.id_vente}`, token);
  assert.equal(Number(payment.id_client), Number(paidSale.client_id), "client paiement/vente different");
  const activePayments = (paidSale.paiements || []).filter((item) => item.statut_paiement !== "Annulé");
  const paidTotal = money(activePayments.reduce((sum, item) => sum + Number(item.montant_paye || 0), 0));
  assert.equal(paidTotal, money(paidSale.montant_payee), "total des paiements incoherent avec la vente");
  assert.ok(paidTotal <= money(paidSale.montant_total_vente), "paiement superieur a la facture");
  console.log(`OK  vente ${paidSale.id} -> paiements: ${activePayments.length} reglement(s), client et total coherents`);

  const documents = new Map();
  for (const row of journal) {
    const key = row.numdocument || `sans-document-${row.id_ecriture}`;
    const totals = documents.get(key) || { debit: 0, credit: 0, lines: 0 };
    totals.debit += Number(row.debit || 0);
    totals.credit += Number(row.credit || 0);
    totals.lines += 1;
    documents.set(key, totals);
  }
  const unbalanced = [...documents.entries()].filter(([, totals]) => money(totals.debit) !== money(totals.credit) || totals.lines < 2);
  assert.deepEqual(unbalanced, [], `documents comptables non equilibres: ${unbalanced.map(([key]) => key).join(", ")}`);
  console.log(`OK  comptabilite SYSCOHADA: ${documents.size} document(s) equilibre(s)`);

  const reportNames = await request("/rapports", token);
  requireRows("rapports disponibles", reportNames);
  for (const name of reportNames) {
    const rows = await request(`/rapports/${name}`, token);
    assert.ok(Array.isArray(rows), `rapport ${name}: format invalide`);
  }
  console.log(`OK  ${reportNames.length} etat(s) de sortie interroge(s)`);
  console.log("OK  validation metier terminee sans modification de donnees");
})().catch((error) => {
  console.error(`ECHEC  ${error.message}`);
  process.exit(1);
});
