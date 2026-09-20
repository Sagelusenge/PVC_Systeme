require("dotenv").config();
const db = require("../src/config/database");
const { hashPassword } = require("../src/utils/password");

const tables = new Set([
  "tmatierepremiere", "tclient", "tproduitfini", "tjournal", "tsous_comptes",
  "tentreematiere", "tentrees_pf", "tventeproduitfini", "tdetails_vente",
  "tpaiements_clients", "tcommandeclient", "tdetails_commandeclient", "tpersonnel",
  "tpostes", "taffectations_personnel", "tpresences", "tmateriels", "tecritures_comptables", "tutilisateurs",
]);

function safeTable(table) {
  if (!tables.has(table)) throw new Error(`Table non autorisee: ${table}`);
  return `\`${table}\``;
}

async function ensure(table, keys, data) {
  const where = Object.keys(keys).map((key) => `\`${key}\` = ?`).join(" AND ");
  const existing = await db.query(`SELECT * FROM ${safeTable(table)} WHERE ${where} LIMIT 1`, Object.values(keys));
  const payload = { ...keys, ...data };
  if (existing[0]) {
    const updateKeys = Object.keys(data);
    if (updateKeys.length) {
      await db.query(
        `UPDATE ${safeTable(table)} SET ${updateKeys.map((key) => `\`${key}\` = ?`).join(", ")} WHERE ${where}`,
        [...updateKeys.map((key) => data[key]), ...Object.values(keys)]
      );
    }
    return existing[0].id ?? existing[0].id_materiel ?? existing[0].id_paiement ?? existing[0].id_detail_commande;
  }
  const columns = Object.keys(payload);
  const result = await db.query(
    `INSERT INTO ${safeTable(table)} (${columns.map((key) => `\`${key}\``).join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
    columns.map((key) => payload[key])
  );
  return result.insertId;
}

function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

async function run() {
  await db.query("UPDATE tmatierepremiere SET reference='REF-RPVC-K67', designation='Resine PVC suspension K67', unite_mesure='KG', stock_actuel=8200, cmup=1.48, seuil_reappro=2500 WHERE reference='REF001'");
  await db.query("UPDATE tmatierepremiere SET reference='REF-CACO3', designation='Carbonate de calcium industriel', unite_mesure='KG', stock_actuel=5600, cmup=0.26, seuil_reappro=1800 WHERE reference='PVC1'");

  const materials = [
    ["REF-RPVC-K67", "Resine PVC suspension K67", "KG", 8200, 1.48, 2500],
    ["REF-CACO3", "Carbonate de calcium industriel", "KG", 5600, 0.26, 1800],
    ["REF-STAB-CZN", "Stabilisant calcium-zinc", "KG", 920, 2.85, 300],
    ["REF-PIG-BL", "Pigment blanc industriel", "KG", 410, 3.75, 150],
    ["REF-EMB-110", "Sachets emballage tubes 110 mm", "Carton", 48, 22.5, 20],
  ];
  const materialIds = {};
  for (const [reference, designation, unite_mesure, stock_actuel, cmup, seuil_reappro] of materials) {
    materialIds[reference] = await ensure("tmatierepremiere", { reference }, { designation, unite_mesure, stock_actuel, cmup, seuil_reappro });
  }

  const clients = [
    ["CLI-KIN-001", "Bati Congo SARL", "Avenue du Commerce 18, Gombe", "30 jours", 2180],
    ["CLI-LSH-002", "Katanga Construction", "Route Likasi 42, Lubumbashi", "Comptant", 0],
    ["CLI-KOL-003", "Etablissements Mwana", "Boulevard Kabila, Kolwezi", "15 jours", 740],
    ["CLI-LKS-004", "Hydro Services RDC", "Avenue Lumumba 6, Likasi", "30 jours", 1260],
  ];
  const clientIds = {};
  for (const [code, raison_sociale, adresse, conditions_paiement, solde_compte] of clients) {
    clientIds[code] = await ensure("tclient", { code }, { raison_sociale, adresse, conditions_paiement, solde_compte });
  }

  const products = [
    ["PF-TUBE-032", "Tube PVC evacuation 32 mm", "PIECE", 4.8, 1250],
    ["PF-TUBE-110", "Tube PVC evacuation 110 mm", "PIECE", 18.5, 420],
    ["PF-GAINE-020", "Gaine electrique PVC 20 mm", "PIECE", 2.9, 1680],
    ["PF-PROFIL-06", "Profile PVC plafond 6 m", "PIECE", 12.75, 360],
  ];
  const productIds = {};
  for (const [code, libelle, unite, prix_unitaire, stock_actuel] of products) {
    productIds[code] = await ensure("tproduitfini", { code }, { libelle, unite, prix_unitaire, stock_actuel });
  }

  const journals = [["ACH", "Journal des achats"], ["VTE", "Journal des ventes"], ["BQ", "Journal de banque"], ["OD", "Operations diverses"]];
  const journalIds = {};
  for (const [codejr, nom_journal] of journals) journalIds[codejr] = await ensure("tjournal", { codejr }, { nom_journal });

  const accountRows = await db.query("SELECT id, numero FROM tcomptes");
  const accountByNumber = Object.fromEntries(accountRows.map((row) => [row.numero, row.id]));
  const subAccounts = [
    ["321100", "Stock resines et additifs PVC", "32"],
    ["361100", "Stock produits finis PVC", "36"],
    ["401100", "Fournisseurs matieres premieres", "40"],
    ["411100", "Clients ventes locales", "41"],
    ["421100", "Personnel - remunerations dues", "42"],
    ["241100", "Materiel industriel extrusion", "24"],
  ];
  const subAccountIds = {};
  for (const [numero, intitule, accountNumber] of subAccounts) {
    subAccountIds[numero] = await ensure("tsous_comptes", { numero }, { intitule, compte_id: accountByNumber[accountNumber] });
  }

  await ensure("tentreematiere", { date_entree: dateDaysAgo(12), matiere_premiere_id: materialIds["REF-RPVC-K67"] }, { agent_achat_id: null, quantite: 3500, unite: "KG", prix_unitaire_entree: 1.48, montant_payer: 5180 });
  await ensure("tentreematiere", { date_entree: dateDaysAgo(9), matiere_premiere_id: materialIds["REF-CACO3"] }, { agent_achat_id: null, quantite: 2400, unite: "KG", prix_unitaire_entree: 0.26, montant_payer: 624 });
  await ensure("tentreematiere", { date_entree: dateDaysAgo(5), matiere_premiere_id: materialIds["REF-STAB-CZN"] }, { agent_achat_id: null, quantite: 500, unite: "KG", prix_unitaire_entree: 2.85, montant_payer: 1425 });

  await ensure("tentrees_pf", { id_produit_fini: productIds["PF-TUBE-032"], date_entree: `${dateDaysAgo(6)} 08:30:00` }, { quantite_entree: 600, unite_mesure: "PIECE", cout_production_unitaire: 2.62 });
  await ensure("tentrees_pf", { id_produit_fini: productIds["PF-TUBE-110"], date_entree: `${dateDaysAgo(4)} 14:10:00` }, { quantite_entree: 180, unite_mesure: "PIECE", cout_production_unitaire: 10.4 });
  await ensure("tentrees_pf", { id_produit_fini: productIds["PF-GAINE-020"], date_entree: `${dateDaysAgo(2)} 10:20:00` }, { quantite_entree: 900, unite_mesure: "PIECE", cout_production_unitaire: 1.35 });

  const sales = [
    [dateDaysAgo(8), "CLI-KIN-001", "PF-TUBE-110", 80, 18.5, 1000, "CREDIT"],
    [dateDaysAgo(5), "CLI-LSH-002", "PF-TUBE-032", 240, 4.8, 1152, "CASH"],
    [dateDaysAgo(2), "CLI-KOL-003", "PF-PROFIL-06", 100, 12.75, 535, "CREDIT"],
  ];
  for (const [date_vente, clientCode, productCode, quantity, price, paid, type] of sales) {
    const total = quantity * price;
    const saleId = await ensure("tventeproduitfini", { date_vente, client_id: clientIds[clientCode] }, { montant_total_vente: total, montant_payee: paid, type_paiement: type, etat_paiement: paid >= total ? "payé" : "non payé" });
    await ensure("tdetails_vente", { id_vente: saleId, id_produit_fini: productIds[productCode] }, { quantite_vendue: quantity, prix_vente_unitaire_reel: price });
  }

  const saleForPayment = await db.query("SELECT id FROM tventeproduitfini WHERE client_id=? ORDER BY id DESC LIMIT 1", [clientIds["CLI-KIN-001"]]);
  if (saleForPayment[0]) await ensure("tpaiements_clients", { id_vente: saleForPayment[0].id, libelle: "Acompte facture tubes PVC 110 mm" }, { id_client: clientIds["CLI-KIN-001"], date_paiement: `${dateDaysAgo(3)} 11:00:00`, montant_paye: 1000, um: "USD", type_paiement: "Comptant", statut_paiement: "Partiel" });

  const orders = [
    ["CMD-2026-041", "CLI-LKS-004", "PF-TUBE-110", 120, 18.5, "en attente", 600],
    ["CMD-2026-042", "CLI-KIN-001", "PF-GAINE-020", 500, 2.9, "en attente", 500],
    ["CMD-2026-039", "CLI-LSH-002", "PF-TUBE-032", 300, 4.8, "livrée", 1440],
  ];
  for (let index = 0; index < orders.length; index += 1) {
    const [numero, clientCode, productCode, quantity, price, statut, advance] = orders[index];
    const orderId = await ensure("tcommandeclient", { numero }, { date_commande: dateDaysAgo(7 - index * 2), client_id: clientIds[clientCode], date_livraison_prevue: dateDaysAgo(-5 - index), statut, montant_tot: quantity * price, montant_anticipation: advance, date_paiement_anticipation: dateDaysAgo(7 - index * 2) });
    await ensure("tdetails_commandeclient", { id_commande: orderId, id_produit_fini: productIds[productCode] }, { quantite_commandee: quantity, prix_vente_unitaire: price });
  }

  const staff = [
    ["Kabeya", "Ilunga", "Patrick", "+243970110201", "Kampemba, Lubumbashi"],
    ["Mutombo", "Kalala", "Grace", "+243970110202", "Kenya, Lubumbashi"],
    ["Mwamba", "Kisimba", "Aline", "+243970110203", "Ruashi, Lubumbashi"],
    ["Kasongo", "Banza", "Joel", "+243970110204", "Annexe, Lubumbashi"],
  ];
  const staffIds = [];
  for (const [nom, postnom, prenom, numtelephon, adresse] of staff) staffIds.push(await ensure("tpersonnel", { numtelephon }, { nom, postnom, prenom, adresse, statut: 1 }));
  const posteIds = [
    await ensure("tpostes", { nom_poste: "Chef de ligne extrusion" }, { salaire_mensuel: 980 }),
    await ensure("tpostes", { nom_poste: "Operateur extrusion" }, { salaire_mensuel: 620 }),
    await ensure("tpostes", { nom_poste: "Magasinier matieres" }, { salaire_mensuel: 580 }),
    await ensure("tpostes", { nom_poste: "Comptable principal" }, { salaire_mensuel: 850 }),
  ];
  for (let index = 0; index < staffIds.length; index += 1) {
    await ensure("taffectations_personnel", { id_perso: staffIds[index], poste_id: posteIds[index] }, { date_affectation: dateDaysAgo(180 - index * 15) });
    await ensure("tpresences", { id_agent: staffIds[index], heure_arrivee: `${dateDaysAgo(0)} 07:${String(25 + index * 4).padStart(2, "0")}:00` }, { heure_sortie: `${dateDaysAgo(0)} 16:30:00`, est_ferie: 0 });
  }

  const assets = [
    ["EXT-L1-2024", "Extrudeuse double vis ligne 1", dateDaysAgo(620), 84500, 10, 10, "Importation Afrique du Sud"],
    ["MEL-500-2025", "Melangeur industriel 500 kg", dateDaysAgo(310), 28600, 12.5, 8, "Fournisseur Zambie"],
    ["GRP-250-2025", "Groupe electrogene 250 kVA", dateDaysAgo(190), 39200, 10, 10, "Distributeur Lubumbashi"],
  ];
  for (const [code_materiel, designation, date_acquisition, valeur_acquisition, taux_amortissement, duree_utilisation, provenance] of assets) {
    await ensure("tmateriels", { code_materiel }, { designation, date_acquisition, valeur_acquisition, amortissable: 1, taux_amortissement, mode_amortissement: "lineaire", periodicite: "Mensuel", duree_utilisation, valeur_residuelle: 0, provenance, statut: "en service" });
  }

  const entries = [
    [journalIds.ACH, "ACH-26091", subAccountIds["321100"], "C", "Reception resine PVC K67", subAccountIds["401100"], 5180],
    [journalIds.ACH, "ACH-26092", subAccountIds["401100"], "CP", "Dette fournisseur resine PVC", subAccountIds["321100"], 5180],
    [journalIds.VTE, "VTE-26041", subAccountIds["411100"], "C", "Vente tubes PVC 110 mm", subAccountIds["361100"], 1480],
    [journalIds.VTE, "VTE-26042", subAccountIds["361100"], "CP", "Sortie produits finis PVC", subAccountIds["411100"], 1480],
  ];
  for (let index = 0; index < entries.length; index += 1) {
    const [journal_id, numdocument, sous_compte_id, sens, libelle, sous_compte_cp, montant] = entries[index];
    await ensure("tecritures_comptables", { numdocument, sens }, { journal_id, sous_compte_id, libelle, sous_compte_cp, date_ecriture: `${dateDaysAgo(6 - index)} 09:00:00`, montant, um: "USD", taux_convertion_usd_fc: 2850, id_user: "sagelusenge@gmail.com" });
  }

  const roleRows = await db.query("SELECT id, nom_role FROM troles");
  const roleIds = Object.fromEntries(roleRows.map((role) => [role.nom_role, role.id]));
  const sharedPassword = await hashPassword("password");
  await db.query("UPDATE tutilisateurs SET mot_de_passe=? WHERE nom_utilisateur IN ('Lus','sagelusenge@gmail.com')", [sharedPassword]);
  const roleUsers = [
    ["comptable@gmail.com", "Comptable"],
    ["caissier@gmail.com", "Caissier"],
    ["rh@gmail.com", "RH"],
    ["direction@gmail.com", "Direction"],
    ["commercial@gmail.com", "Commercial"],
    ["magasinier@gmail.com", "Magasinier"],
    ["achats@gmail.com", "Agent d'achat"],
    ["production@gmail.com", "Responsable production"],
    ["immobilisations@gmail.com", "Responsable immobilisations"],
    ["auditeur@gmail.com", "Auditeur"],
  ];
  for (const [email, role] of roleUsers) {
    await ensure("tutilisateurs", { nom_utilisateur: email }, { email, mot_de_passe: sharedPassword, statut: "Actif", role_id: roleIds[role] });
  }

  console.log("Donnees operationnelles initialisees avec succes.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => db.pool.end());
