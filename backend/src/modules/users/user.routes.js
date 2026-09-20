const express = require("express");
const controller = require("./user.controller");
const validation = require("./user.validation");
const validate = require("../../middlewares/validation.middleware");
const allowRoles = require("../../middlewares/role.middleware");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();
router.use(allowRoles("Administrateur"));
router.get("/roles", asyncHandler(controller.roles));
router.post("/roles", validate(validation.roleSchema), asyncHandler(controller.createRole));
router.patch("/roles/:id", validate(validation.updateRoleSchema), asyncHandler(controller.updateRole));
router.delete("/roles/:id", asyncHandler(controller.removeRole));
router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.get));
router.post("/", validate(validation.createSchema), asyncHandler(controller.create));
router.patch("/:id", validate(validation.updateSchema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.deactivate));

module.exports = router;
