const API_URL = (process.env.QA_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const PASSWORD = process.env.QA_PASSWORD || "password";

const modules = {
  accounting: "/comptabilite/references",
  stock: "/stock/matieres?limit=1",
  production: "/production/produits?limit=1",
  sales: "/ventes?limit=1",
  orders: "/commandes?limit=1",
  clients: "/clients?limit=1",
  assets: "/immobilisations/materiels?limit=1",
  hr: "/rh/personnel?limit=1",
  reports: "/rapports",
  administration: "/users?limit=1",
};

const accounts = [
  ["sagelusenge@gmail.com", "Administrateur", Object.keys(modules)],
  ["direction@gmail.com", "Direction", ["accounting", "stock", "production", "sales", "orders", "clients", "assets", "hr", "reports"]],
  ["comptable@gmail.com", "Comptable", ["accounting", "assets", "reports"]],
  ["caissier@gmail.com", "Caissier", ["sales", "clients"]],
  ["rh@gmail.com", "RH", ["hr"]],
  ["commercial@gmail.com", "Commercial", ["sales", "orders", "clients"]],
  ["magasinier@gmail.com", "Magasinier", ["stock"]],
  ["achats@gmail.com", "Agent d'achat", ["stock"]],
  ["production@gmail.com", "Responsable production", ["stock", "production"]],
  ["immobilisations@gmail.com", "Responsable immobilisations", ["assets"]],
  ["auditeur@gmail.com", "Auditeur", ["accounting", "reports"]],
];

async function call(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status} - ${payload?.message || "reponse invalide"}`);
  return payload?.data;
}

async function validateAccount([email, role, allowedModules]) {
  const login = await call("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nom_utilisateur: email, mot_de_passe: PASSWORD }),
  });
  if (login.user.nom_role !== role) throw new Error(`${email}: role ${login.user.nom_role}, attendu ${role}`);
  const headers = { Authorization: `Bearer ${login.token}` };
  const me = await call("/auth/me", { headers });
  if (me.nom_role !== role) throw new Error(`${email}: profil incoherent`);
  await call("/dashboard", { headers });
  for (const moduleName of allowedModules) await call(modules[moduleName], { headers });
  return `${role}: connexion, tableau de bord et ${allowedModules.length} module(s)`;
}

(async () => {
  console.log(`Validation des roles sur ${API_URL}`);
  for (const account of accounts) console.log(`OK  ${await validateAccount(account)}`);
  console.log(`OK  ${accounts.length} roles valides`);
})().catch((error) => {
  console.error(`ECHEC  ${error.message}`);
  process.exit(1);
});
