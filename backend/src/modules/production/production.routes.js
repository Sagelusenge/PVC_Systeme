const express = require("express");
const controller = require("./production.controller");
const schemas = require("./production.validation");
const validate = require("../../middlewares/validation.middleware");
const allowRoles = require("../../middlewares/role.middleware");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();
router.get("/produits", asyncHandler(controller.products.list));
router.get("/produits/:id", asyncHandler(controller.products.get));
router.post("/produits", allowRoles("Responsable production", "Direction"), validate(schemas.createProduct), asyncHandler(controller.products.create));
router.patch("/produits/:id", allowRoles("Responsable production", "Direction"), validate(schemas.updateProduct), asyncHandler(controller.products.update));
router.get("/entrees", asyncHandler(controller.entries.list));
router.get("/entrees/:id", asyncHandler(controller.entries.get));
router.post("/entrees", allowRoles("Responsable production"), validate(schemas.createEntry), asyncHandler(controller.entries.create));

module.exports = router;
