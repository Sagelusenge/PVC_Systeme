import test from "node:test";
import assert from "node:assert/strict";
import { canAccessModule, MODULE_ACCESS, ROLES } from "../src/utils/permissions.js";

const expectedModules = {
  [ROLES.ADMIN]: Object.keys(MODULE_ACCESS),
  [ROLES.DIRECTION]: ["dashboard", "accounting", "accountingEntries", "stock", "production", "sales", "orders", "clients", "assets", "hr", "reports", "guide"],
  [ROLES.ACCOUNTANT]: ["dashboard", "accounting", "accountingEntries", "assets", "reports", "guide"],
  [ROLES.CASHIER]: ["dashboard", "sales", "clients", "guide"],
  [ROLES.HR]: ["dashboard", "hr", "guide"],
  [ROLES.SALES]: ["dashboard", "sales", "orders", "clients", "guide"],
  [ROLES.STOREKEEPER]: ["dashboard", "stock", "guide"],
  [ROLES.BUYER]: ["dashboard", "stock", "guide"],
  [ROLES.PRODUCTION]: ["dashboard", "stock", "production", "guide"],
  [ROLES.ASSETS]: ["dashboard", "assets", "guide"],
  [ROLES.AUDITOR]: ["dashboard", "accounting", "reports", "guide"],
};

for (const [role, allowedModules] of Object.entries(expectedModules)) {
  test(`navigation autorisee pour ${role}`, () => {
    for (const moduleName of Object.keys(MODULE_ACCESS)) {
      assert.equal(
        canAccessModule(role, moduleName),
        allowedModules.includes(moduleName),
        `${role} / ${moduleName}`
      );
    }
  });
}

test("un utilisateur inconnu ne recoit aucun acces", () => {
  for (const moduleName of Object.keys(MODULE_ACCESS)) {
    assert.equal(canAccessModule("Role inconnu", moduleName), false);
  }
  assert.equal(canAccessModule(null, "dashboard"), false);
  assert.equal(canAccessModule(ROLES.ADMIN, "module-inconnu"), false);
});
