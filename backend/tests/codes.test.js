const { after, test } = require("node:test");
const assert = require("node:assert/strict");
const { nextCode } = require("../src/utils/codes");
const { pool } = require("../src/config/database");

after(() => pool.end());

test("le prochain code ignore les valeurs non conformes", async () => {
  const connection = {
    async query() {
      return [{ code: "CLI-0002" }, { code: "ancien-code" }, { code: "CLI-0010" }];
    },
  };
  assert.equal(await nextCode({ table: "clients", column: "code", prefix: "CLI-", connection }), "CLI-0011");
});

test("le premier code respecte la largeur demandee", async () => {
  const connection = { query: async () => [] };
  assert.equal(await nextCode({ table: "commandes", column: "numero", prefix: "CMD-2026-", width: 4, connection }), "CMD-2026-0001");
});
