const express = require("express");
const { testDatabaseConnection } = require("../config/database");
const auth = require("../middlewares/auth.middleware");
const audit = require("../middlewares/audit.middleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "pvc-management-api",
  });
});

router.get("/db/health", asyncHandler(async (req, res) => {
  res.json({ status: "ok", database: await testDatabaseConnection() });
}));

router.use("/auth", require("../modules/auth/auth.routes"));
router.use(auth);
router.use(audit);
router.use("/users", require("../modules/users/user.routes"));
router.use("/clients", require("../modules/clients/client.routes"));
router.use("/commandes", require("../modules/commandes/commande.routes"));
router.use("/ventes", require("../modules/ventes/vente.routes"));
router.use("/paiements", require("../modules/paiements/paiement.routes"));
router.use("/stock", require("../modules/stock/stock.routes"));
router.use("/production", require("../modules/production/production.routes"));
router.use("/comptabilite", require("../modules/comptabilite/comptabilite.routes"));
router.use("/rh", require("../modules/rh/rh.routes"));
router.use("/immobilisations", require("../modules/immobilisations/immobilisation.routes"));
router.use("/dashboard", require("../modules/dashboard/dashboard.routes"));
router.use("/rapports", require("../modules/rapports/rapport.routes"));

module.exports = router;
