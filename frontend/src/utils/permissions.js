export const ROLES = Object.freeze({
  ADMIN: "Administrateur",
  DIRECTION: "Direction",
  ACCOUNTANT: "Comptable",
  CASHIER: "Caissier",
  HR: "RH",
  SALES: "Commercial",
  STOREKEEPER: "Magasinier",
  BUYER: "Agent d'achat",
  PRODUCTION: "Responsable production",
  ASSETS: "Responsable immobilisations",
  AUDITOR: "Auditeur",
});

export const MODULE_ACCESS = Object.freeze({
  dashboard: [],
  accounting: [ROLES.ACCOUNTANT, ROLES.DIRECTION, ROLES.AUDITOR],
  accountingEntries: [ROLES.ACCOUNTANT, ROLES.DIRECTION],
  stock: [ROLES.STOREKEEPER, ROLES.BUYER, ROLES.PRODUCTION, ROLES.DIRECTION],
  production: [ROLES.PRODUCTION, ROLES.DIRECTION],
  sales: [ROLES.SALES, ROLES.CASHIER, ROLES.DIRECTION],
  orders: [ROLES.SALES, ROLES.DIRECTION],
  clients: [ROLES.SALES, ROLES.CASHIER, ROLES.DIRECTION],
  assets: [ROLES.ASSETS, ROLES.ACCOUNTANT, ROLES.DIRECTION],
  hr: [ROLES.HR, ROLES.DIRECTION],
  reports: [ROLES.ACCOUNTANT, ROLES.DIRECTION, ROLES.AUDITOR],
  administration: [ROLES.ADMIN],
  guide: [],
});

export function canAccessModule(role, moduleName) {
  if (!role || !Object.hasOwn(MODULE_ACCESS, moduleName)) return false;
  if (!Object.values(ROLES).includes(role)) return false;
  if (role === ROLES.ADMIN) return true;
  const allowedRoles = MODULE_ACCESS[moduleName];
  return allowedRoles.length === 0 || allowedRoles.includes(role);
}
