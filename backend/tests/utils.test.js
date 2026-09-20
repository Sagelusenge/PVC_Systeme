const test = require("node:test");
const assert = require("node:assert/strict");
const { getPagination, paginationMeta } = require("../src/utils/pagination");
const { hashPassword, verifyPassword } = require("../src/utils/password");

test("pagination applique les limites", () => {
  assert.deepEqual(getPagination({ page: "2", limit: "25" }), { page: 2, limit: 25, offset: 25 });
  assert.equal(getPagination({ limit: "999" }).limit, 100);
  assert.deepEqual(paginationMeta(51, 2, 25), { total: 51, page: 2, limit: 25, pages: 3 });
});

test("mot de passe bcrypt", async () => {
  const hash = await hashPassword("MotDePasse123!");
  assert.equal(await verifyPassword("MotDePasse123!", hash), true);
  assert.equal(await verifyPassword("incorrect", hash), false);
});

test("ancien hash SHA-256 accepte pour migration", async () => {
  const legacyHash = "2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b";
  assert.equal(await verifyPassword("secret", legacyHash), true);
});
