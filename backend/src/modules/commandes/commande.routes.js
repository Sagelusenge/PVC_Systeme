const express = require("express");
const controller = require("./commande.controller");
const schemas = require("./commande.validation");
const validate = require("../../middlewares/validation.middleware");
const allowRoles = require("../../middlewares/role.middleware");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();
router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.get));
router.post("/", allowRoles("Commercial", "Direction"), validate(schemas.createSchema), asyncHandler(controller.create));
router.patch("/:id", allowRoles("Commercial", "Direction"), validate(schemas.updateSchema), asyncHandler(controller.update));
router.delete("/:id", allowRoles("Direction"), asyncHandler(controller.remove));
module.exports = router;
