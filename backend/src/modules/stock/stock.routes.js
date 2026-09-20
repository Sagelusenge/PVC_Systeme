const express = require("express");
const controller = require("./stock.controller");
const schemas = require("./stock.validation");
const validate = require("../../middlewares/validation.middleware");
const allowRoles = require("../../middlewares/role.middleware");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();
const canManage = allowRoles("Magasinier", "Agent d'achat", "Responsable production", "Direction");
router.get("/alertes", asyncHandler(controller.alerts));
router.get("/mouvements", asyncHandler(controller.movements));
router.get("/matieres", asyncHandler(controller.materials.list));
router.get("/matieres/:id", asyncHandler(controller.materials.get));
router.post("/matieres", canManage, validate(schemas.createMaterial), asyncHandler(controller.materials.create));
router.patch("/matieres/:id", canManage, validate(schemas.updateMaterial), asyncHandler(controller.materials.update));
router.get("/agents-achat", asyncHandler(controller.buyers.list));
router.post("/agents-achat", allowRoles("Agent d'achat", "Direction"), validate(schemas.createBuyer), asyncHandler(controller.buyers.create));
router.patch("/agents-achat/:id", allowRoles("Agent d'achat", "Direction"), validate(schemas.updateBuyer), asyncHandler(controller.buyers.update));
router.get("/entrees", asyncHandler(controller.entries.list));
router.post("/entrees", canManage, validate(schemas.createEntry), asyncHandler(controller.entries.create));
router.get("/sorties", asyncHandler(controller.exits.list));
router.post("/sorties", allowRoles("Magasinier", "Responsable production"), validate(schemas.createExit), asyncHandler(controller.exits.create));

module.exports = router;
