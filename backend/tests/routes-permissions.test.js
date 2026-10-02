const { after, test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const errorMiddleware = require("../src/middlewares/error.middleware");
const { pool } = require("../src/config/database");

after(() => pool.end());

const ROLES = [
  "Administrateur", "Direction", "Comptable", "Caissier", "RH", "Commercial",
  "Magasinier", "Agent d'achat", "Responsable production",
  "Responsable immobilisations", "Auditeur",
];

const cases = [
  { name: "utilisateurs", router: require("../src/modules/users/user.routes"), path: "/roles", allowed: ["Administrateur"] },
  { name: "clients", router: require("../src/modules/clients/client.routes"), path: "/", allowed: ["Administrateur", "Commercial", "Direction"] },
  { name: "commandes", router: require("../src/modules/commandes/commande.routes"), path: "/", allowed: ["Administrateur", "Commercial", "Direction"] },
  { name: "ventes", router: require("../src/modules/ventes/vente.routes"), path: "/", allowed: ["Administrateur", "Commercial", "Caissier", "Direction"] },
  { name: "paiements", router: require("../src/modules/paiements/paiement.routes"), path: "/", allowed: ["Administrateur", "Caissier", "Comptable", "Direction"] },
  { name: "stock", router: require("../src/modules/stock/stock.routes"), path: "/matieres", allowed: ["Administrateur", "Magasinier", "Agent d'achat", "Responsable production", "Direction"] },
  { name: "production", router: require("../src/modules/production/production.routes"), path: "/produits", allowed: ["Administrateur", "Responsable production", "Direction"] },
  { name: "comptabilite", router: require("../src/modules/comptabilite/comptabilite.routes"), path: "/ecritures", allowed: ["Administrateur", "Comptable", "Direction"] },
  { name: "ressources humaines", router: require("../src/modules/rh/rh.routes"), path: "/personnel", allowed: ["Administrateur", "RH", "Direction"] },
  { name: "immobilisations", router: require("../src/modules/immobilisations/immobilisation.routes"), path: "/materiels", allowed: ["Administrateur", "Responsable immobilisations", "Comptable", "Direction"] },
];

function appFor(router, role) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    req.user = { id: 1, nom_utilisateur: "qa", nom_role: role };
    next();
  });
  app.use(router);
  app.use(errorMiddleware);
  return app;
}

for (const routeCase of cases) {
  test(`droits d'ecriture: ${routeCase.name}`, async () => {
    for (const role of ROLES) {
      const response = await request(appFor(routeCase.router, role)).post(routeCase.path).send({});
      const expected = routeCase.allowed.includes(role) ? 422 : 403;
      assert.equal(response.status, expected, `${routeCase.name}: ${role}`);
    }
  });
}
