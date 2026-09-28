async function findId(connection, sql, value, label) {
  const rows = await connection.query(sql, [value]);
  if (!rows[0]) throw new Error(`Configuration comptable manquante: ${label}`);
  return rows[0].id;
}

async function exchangeRate(connection) {
  const rows = await connection.query(
    "SELECT valeur FROM tparametres_application WHERE cle='taux_usd_fc' LIMIT 1"
  );
  return Number(rows[0]?.valeur || 2850);
}

async function insertEntry(connection, data) {
  const existing = await connection.query(
    "SELECT id FROM tecritures_comptables WHERE source_type=? AND source_id=? AND sens=? LIMIT 1",
    [data.sourceType, data.sourceId, data.sens]
  );
  if (existing[0]) return existing[0].id;
  const result = await connection.query(
    `INSERT INTO tecritures_comptables
      (journal_id,numdocument,sous_compte_id,sens,libelle,sous_compte_cp,date_ecriture,montant,um,taux_convertion_usd_fc,id_user,source_type,source_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [data.journalId, data.document, data.accountId, data.sens, data.label, data.counterpartId,
      data.date, data.amount, "USD", data.rate, data.user || "SYSTEME", data.sourceType, data.sourceId]
  );
  return result.insertId;
}

async function insertPair(connection, data) {
  await insertEntry(connection, { ...data, sens: "C", accountId: data.debitId, counterpartId: data.creditId });
  await insertEntry(connection, { ...data, sens: "CP", accountId: data.creditId, counterpartId: data.debitId });
}

async function recordSale(connection, { saleId, amount, date, user }) {
  const journalId = await findId(connection, "SELECT id FROM tjournal WHERE codejr=? LIMIT 1", "VTE", "journal VTE");
  const clientId = await findId(connection, "SELECT id FROM tsous_comptes WHERE numero=? LIMIT 1", "411100", "compte clients 411100");
  const revenueId = await findId(connection, "SELECT id FROM tsous_comptes WHERE numero=? LIMIT 1", "701100", "compte ventes 701100");
  await insertPair(connection, {
    journalId, document: `VTE${String(saleId).padStart(7, "0")}`, debitId: clientId, creditId: revenueId,
    label: `Facture de vente VTE-${String(saleId).padStart(5, "0")}`, date, amount, rate: await exchangeRate(connection),
    user, sourceType: "VENTE", sourceId: saleId,
  });
}

async function recordPayment(connection, { paymentId, amount, date, user, cash = false, reversal = false }) {
  const journalId = await findId(connection, "SELECT id FROM tjournal WHERE codejr=? LIMIT 1", "BQ", "journal de tresorerie BQ");
  const clientId = await findId(connection, "SELECT id FROM tsous_comptes WHERE numero=? LIMIT 1", "411100", "compte clients 411100");
  const treasuryNumber = cash ? "571100" : "521100";
  const treasuryId = await findId(connection, "SELECT id FROM tsous_comptes WHERE numero=? LIMIT 1", treasuryNumber, `compte ${treasuryNumber}`);
  await insertPair(connection, {
    journalId, document: `${reversal ? "ANU" : "REG"}${String(paymentId).padStart(7, "0")}`,
    debitId: reversal ? clientId : treasuryId, creditId: reversal ? treasuryId : clientId,
    label: `${reversal ? "Annulation du reglement" : "Reglement client"} REC-${paymentId}`,
    date, amount, rate: await exchangeRate(connection), user,
    sourceType: reversal ? "REGLEMENT_ANNULE" : "REGLEMENT", sourceId: paymentId,
  });
}

module.exports = { recordSale, recordPayment };
