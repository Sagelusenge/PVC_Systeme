require("dotenv").config();
const db = require("../src/config/database");
const { recordPayment, recordSale } = require("../src/shared/accounting");

const TARGET = 100;
const cities = ["Lubumbashi", "Kinshasa", "Kolwezi", "Likasi", "Kipushi", "Kasumbalesa", "Kamina", "Mbuji-Mayi", "Kananga", "Matadi"];
const companyNames = ["Bâtisseurs du Katanga", "Hydro Congo", "Immo Horizon", "Établissements Kasaï", "Génie Construction", "Maison Technique", "Solutions Minières", "Travaux Modernes", "Distribution Centrale", "Infrastructures Réunies"];
const surnames = ["Kabeya", "Ilunga", "Mwamba", "Mutombo", "Kasongo", "Banza", "Kalala", "Kanku", "Tshibangu", "Mukendi", "Lukusa", "Kalonji", "Mbuyi", "Kabasele", "Mpoyi"];
const firstNames = ["Patrick", "Grâce", "Aline", "Joël", "Chantal", "David", "Esther", "Junior", "Nadine", "Serge", "Prisca", "Michel"];
const productFamilies = ["Tube pression", "Tube évacuation", "Gaine électrique", "Profilé plafond", "Raccord PVC"];
const diameters = [20, 25, 30, 32, 40, 50, 60, 63, 75, 90, 100, 110, 125, 140, 160, 200];
const materialNames = ["Résine PVC K67", "Carbonate de calcium", "Stabilisant calcium-zinc", "Pigment blanc", "Lubrifiant PE", "Modifiant d'impact", "Cire paraffine", "Emballage tube", "Colorant industriel", "Charge minérale"];
const assetNames = ["Extrudeuse", "Mélangeur industriel", "Compresseur", "Groupe électrogène", "Chariot élévateur", "Refroidisseur", "Broyeur PVC", "Imprimante industrielle", "Balance de précision", "Moule d'extrusion"];

function day(offset) {
  const value = new Date();
  value.setDate(value.getDate() - offset);
  return value.toISOString().slice(0, 10);
}

async function count(connection, table) {
  const rows = await connection.query(`SELECT COUNT(*) total FROM \`${table}\``);
  return Number(rows[0].total);
}

async function run() {
  await db.withTransaction(async (connection) => {
    let current = await count(connection, "tclient");
    for (let index = current; index < TARGET; index += 1) {
      const code = `CLI-${String(index + 1).padStart(4, "0")}`;
      const company = `${companyNames[index % companyNames.length]} ${surnames[Math.floor(index / companyNames.length) % surnames.length]} SARL`;
      await connection.query(
        "INSERT INTO tclient (code,raison_sociale,adresse,conditions_paiement,solde_compte) VALUES (?,?,?,?,0)",
        [code, company, `Avenue ${surnames[index % surnames.length]} ${10 + index}, ${cities[index % cities.length]}`, index % 3 === 0 ? "Comptant" : `Tranche - ${15 + (index % 4) * 15} jours`]
      );
    }

    current = await count(connection, "tproduitfini");
    for (let index = current; index < TARGET; index += 1) {
      const diameter = diameters[index % diameters.length];
      const family = productFamilies[index % productFamilies.length];
      await connection.query(
        "INSERT INTO tproduitfini (code,libelle,unite,prix_unitaire,stock_actuel) VALUES (?,?,?,?,?)",
        [`PF-${String(index + 1).padStart(4, "0")}`, `${family} ${diameter} mm - série ${Math.floor(index / diameters.length) + 1}`, "PIECE", Number((2.5 + diameter * 0.12 + (index % 7)).toFixed(2)), 2500 + index * 8]
      );
    }

    current = await count(connection, "tmatierepremiere");
    for (let index = current; index < TARGET; index += 1) {
      await connection.query(
        "INSERT INTO tmatierepremiere (reference,designation,unite_mesure,stock_actuel,cmup,seuil_reappro) VALUES (?,?,?,?,?,?)",
        [`MP-${String(index + 1).padStart(4, "0")}`, `${materialNames[index % materialNames.length]} lot ${Math.floor(index / materialNames.length) + 1}`, index % 4 === 3 ? "Carton" : "KG", 900 + index * 17, Number((0.4 + (index % 12) * 0.32).toFixed(2)), 250 + (index % 8) * 40]
      );
    }

    current = await count(connection, "tpersonnel");
    for (let index = current; index < TARGET; index += 1) {
      await connection.query(
        "INSERT INTO tpersonnel (nom,postnom,prenom,numtelephon,adresse,statut) VALUES (?,?,?,?,?,1)",
        [surnames[index % surnames.length], surnames[(index + 4) % surnames.length], firstNames[index % firstNames.length], `+24397${String(100000 + index).padStart(6, "0")}`, `${cities[index % cities.length]}, quartier ${surnames[(index + 2) % surnames.length]}`]
      );
    }

    current = await count(connection, "tmateriels");
    for (let index = current; index < TARGET; index += 1) {
      await connection.query(
        `INSERT INTO tmateriels
          (code_materiel,designation,date_acquisition,valeur_acquisition,amortissable,taux_amortissement,mode_amortissement,periodicite,duree_utilisation,valeur_residuelle,provenance,statut)
         VALUES (?,?,?,?,1,?,'lineaire','Annuel',?,?,?,'en service')`,
        [`MAT-${String(index + 1).padStart(4, "0")}`, `${assetNames[index % assetNames.length]} ${String(index + 1).padStart(3, "0")}`, day(120 + index * 3), 1800 + index * 475, 10, 10, 0, cities[(index + 3) % cities.length]]
      );
    }

    const clients = await connection.query("SELECT id FROM tclient ORDER BY id LIMIT 100");
    const products = await connection.query("SELECT id,prix_unitaire FROM tproduitfini ORDER BY id LIMIT 100");
    const materials = await connection.query("SELECT id,cmup,unite_mesure FROM tmatierepremiere ORDER BY id LIMIT 100");
    const personnel = await connection.query("SELECT id FROM tpersonnel ORDER BY id LIMIT 100");

    current = await count(connection, "tentrees_pf");
    for (let index = current; index < TARGET; index += 1) {
      const product = products[index % products.length];
      const quantity = 80 + (index % 12) * 10;
      await connection.query("INSERT INTO tentrees_pf (id_produit_fini,quantite_entree,unite_mesure,date_entree,cout_production_unitaire) VALUES (?,?,'PIECE',?,?)", [product.id, quantity, `${day(index % 60)} 08:30:00`, Number(product.prix_unitaire) * 0.62]);
      await connection.query("UPDATE tproduitfini SET stock_actuel=stock_actuel+? WHERE id=?", [quantity, product.id]);
    }

    current = await count(connection, "tentreematiere");
    for (let index = current; index < TARGET; index += 1) {
      const material = materials[index % materials.length];
      const quantity = 120 + (index % 15) * 20;
      await connection.query("INSERT INTO tentreematiere (date_entree,matiere_premiere_id,agent_achat_id,quantite,unite,prix_unitaire_entree,montant_payer) VALUES (?,?,NULL,?,?,?,?)", [day(index % 75), material.id, quantity, material.unite_mesure, material.cmup, quantity * Number(material.cmup)]);
      await connection.query("UPDATE tmatierepremiere SET stock_actuel=stock_actuel+? WHERE id=?", [quantity, material.id]);
    }

    current = await count(connection, "tsortiematiere");
    for (let index = current; index < TARGET; index += 1) {
      const material = materials[index % materials.length];
      const quantity = 10 + (index % 8) * 3;
      await connection.query("INSERT INTO tsortiematiere (date_sortie,matiere_premiere_id,quantite,unite,cout_unitaire) VALUES (?,?,?,?,?)", [day(index % 70), material.id, quantity, material.unite_mesure, material.cmup]);
      await connection.query("UPDATE tmatierepremiere SET stock_actuel=GREATEST(stock_actuel-?,0) WHERE id=?", [quantity, material.id]);
    }

    current = await count(connection, "tcommandeclient");
    for (let index = current; index < TARGET; index += 1) {
      const client = clients[index % clients.length];
      const first = products[index % products.length];
      const second = products[(index + 17) % products.length];
      const firstQuantity = 4 + index % 9;
      const secondQuantity = 2 + index % 6;
      const total = firstQuantity * Number(first.prix_unitaire) + secondQuantity * Number(second.prix_unitaire);
      const result = await connection.query(
        "INSERT INTO tcommandeclient (numero,date_commande,client_id,date_livraison_prevue,statut,montant_tot,montant_anticipation,date_paiement_anticipation) VALUES (?,?,?,?,?,?,0,NULL)",
        [`CMD-${new Date().getFullYear()}-${String(index + 1).padStart(4, "0")}`, day(index % 80), client.id, day((index % 80) - 7), "en attente", total]
      );
      await connection.query("INSERT INTO tdetails_commandeclient (id_commande,id_produit_fini,quantite_commandee,prix_vente_unitaire) VALUES (?,?,?,?),(?,?,?,?)", [result.insertId, first.id, firstQuantity, first.prix_unitaire, result.insertId, second.id, secondQuantity, second.prix_unitaire]);
    }

    current = await count(connection, "tventeproduitfini");
    for (let index = current; index < TARGET; index += 1) {
      const client = clients[(index * 3) % clients.length];
      const first = products[(index * 2) % products.length];
      const second = products[(index * 2 + 11) % products.length];
      const firstQuantity = 3 + index % 7;
      const secondQuantity = 2 + index % 5;
      const total = firstQuantity * Number(first.prix_unitaire) + secondQuantity * Number(second.prix_unitaire);
      const sale = await connection.query("INSERT INTO tventeproduitfini (date_vente,client_id,montant_total_vente,montant_payee,type_paiement,etat_paiement) VALUES (?,?,?,0,'CREDIT','non payé')", [day(index % 90), client.id, total]);
      await connection.query("INSERT INTO tdetails_vente (id_vente,id_produit_fini,quantite_vendue,prix_vente_unitaire_reel) VALUES (?,?,?,?),(?,?,?,?)", [sale.insertId, first.id, firstQuantity, first.prix_unitaire, sale.insertId, second.id, secondQuantity, second.prix_unitaire]);
      await connection.query("UPDATE tproduitfini SET stock_actuel=stock_actuel-? WHERE id=?", [firstQuantity, first.id]);
      await connection.query("UPDATE tproduitfini SET stock_actuel=stock_actuel-? WHERE id=?", [secondQuantity, second.id]);
      await connection.query("UPDATE tclient SET solde_compte=solde_compte+? WHERE id=?", [total, client.id]);
      await recordSale(connection, { saleId: sale.insertId, amount: total, date: day(index % 90), user: "SYSTEME" });
    }

    current = await count(connection, "tpaiements_clients");
    let paymentIndex = 0;
    while (current < TARGET) {
      const unpaid = await connection.query("SELECT * FROM tventeproduitfini WHERE montant_payee < montant_total_vente ORDER BY id LIMIT 1 OFFSET ?", [paymentIndex % TARGET]);
      const sale = unpaid[0] || (await connection.query("SELECT * FROM tventeproduitfini WHERE montant_payee < montant_total_vente ORDER BY id LIMIT 1"))[0];
      if (!sale) break;
      const remaining = Number(sale.montant_total_vente) - Number(sale.montant_payee);
      const amount = Number(Math.max(0.01, Math.min(remaining, remaining * 0.5)).toFixed(2));
      const payment = await connection.query("INSERT INTO tpaiements_clients (id_client,id_vente,date_paiement,libelle,montant_paye,um,type_paiement,statut_paiement) VALUES (?,?,?,?,?,'USD','Comptant',?)", [sale.client_id, sale.id, `${day(paymentIndex % 75)} 10:00:00`, `Règlement facture VTE-${String(sale.id).padStart(5, "0")}`, amount, amount >= remaining ? "Réglé" : "Partiel"]);
      const newPaid = Number(sale.montant_payee) + amount;
      await connection.query("UPDATE tventeproduitfini SET montant_payee=?, etat_paiement=? WHERE id=?", [newPaid, newPaid >= Number(sale.montant_total_vente) ? "payé" : "non payé", sale.id]);
      await connection.query("UPDATE tclient SET solde_compte=GREATEST(solde_compte-?,0) WHERE id=?", [amount, sale.client_id]);
      await recordPayment(connection, { paymentId: payment.insertId, amount, date: day(paymentIndex % 75), user: "SYSTEME", cash: false });
      current += 1;
      paymentIndex += 1;
    }

    current = await count(connection, "tpresences");
    for (let index = current; index < TARGET; index += 1) {
      const person = personnel[index % personnel.length];
      await connection.query("INSERT INTO tpresences (id_agent,heure_arrivee,heure_sortie,est_ferie) VALUES (?,?,?,0)", [person.id, `${day(index % 28)} 07:${String(20 + index % 35).padStart(2, "0")}:00`, `${day(index % 28)} 16:${String(index % 45).padStart(2, "0")}:00`]);
    }

    current = await count(connection, "tpaies_salaires");
    const period = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
    for (let index = current; index < TARGET; index += 1) {
      const person = personnel[index % personnel.length];
      const base = 420 + (index % 12) * 45;
      await connection.query("INSERT IGNORE INTO tpaies_salaires (id_agent,periode,date_paiement,montant_base,avantages,retenues,montant_net,montant_paye,devise,mode_paiement,reference_paiement,statut) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [person.id, period, `${day(index % 20)} 14:00:00`, base, 35, 10, base + 25, base + 25, "USD", index % 2 ? "Banque" : "Mobile Money", `PAIE-${String(index + 1).padStart(4, "0")}`, "Paye"]);
    }

    const tables = ["tclient", "tproduitfini", "tmatierepremiere", "tpersonnel", "tmateriels", "tcommandeclient", "tventeproduitfini", "tpaiements_clients", "tentrees_pf", "tentreematiere", "tsortiematiere", "tpresences", "tpaies_salaires", "tecritures_comptables"];
    const summary = {};
    for (const table of tables) summary[table] = await count(connection, table);
    console.log("Alimentation terminée:", summary);
  });
}

run().catch((error) => {
  console.error("Alimentation échouée:", error);
  process.exitCode = 1;
}).finally(() => db.pool.end());
