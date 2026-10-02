const test = require("node:test");
const assert = require("node:assert/strict");
const { recordSale, recordPayment } = require("../src/shared/accounting");

function fakeConnection() {
  const entries = [];
  const accounts = { "411100": 411, "701100": 701, "521100": 521, "571100": 571 };
  return {
    entries,
    async query(sql, params = []) {
      if (sql.includes("FROM tjournal")) return [{ id: params[0] === "VTE" ? 10 : 20 }];
      if (sql.includes("FROM tsous_comptes")) return [{ id: accounts[params[0]] }];
      if (sql.includes("FROM tparametres_application")) return [{ valeur: 2850 }];
      if (sql.includes("SELECT id FROM tecritures_comptables")) return [];
      if (sql.includes("INSERT INTO tecritures_comptables")) {
        entries.push(params);
        return { insertId: entries.length };
      }
      throw new Error(`Requete inattendue: ${sql}`);
    },
  };
}

function assertBalancedPair(entries, amount, debitAccount, creditAccount) {
  assert.equal(entries.length, 2);
  const [debit, credit] = entries;
  assert.equal(debit[3], "CP");
  assert.equal(credit[3], "C");
  assert.equal(debit[2], debitAccount);
  assert.equal(debit[5], creditAccount);
  assert.equal(credit[2], creditAccount);
  assert.equal(credit[5], debitAccount);
  assert.equal(Number(debit[7]), amount);
  assert.equal(Number(credit[7]), amount);
}

test("une vente genere une paire SYSCOHADA equilibree", async () => {
  const connection = fakeConnection();
  await recordSale(connection, { saleId: 42, amount: 1250, date: "2026-10-02", user: "qa" });
  assertBalancedPair(connection.entries, 1250, 411, 701);
  assert.equal(connection.entries[0][11], "VENTE");
});

test("un paiement bancaire debite la banque et credite le client", async () => {
  const connection = fakeConnection();
  await recordPayment(connection, { paymentId: 8, amount: 400, date: "2026-10-02", user: "qa" });
  assertBalancedPair(connection.entries, 400, 521, 411);
  assert.equal(connection.entries[0][11], "REGLEMENT");
});

test("l'annulation d'un paiement inverse les comptes", async () => {
  const connection = fakeConnection();
  await recordPayment(connection, { paymentId: 8, amount: 400, date: "2026-10-02", user: "qa", reversal: true });
  assertBalancedPair(connection.entries, 400, 411, 521);
  assert.equal(connection.entries[0][11], "REGLEMENT_ANNULE");
});
