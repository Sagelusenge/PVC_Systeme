const express = require("express");
const controller = require("./client.controller");
const validation = require("./client.validation");
const validate = require("../../middlewares/validation.middleware");
const allowRoles = require("../../middlewares/role.middleware");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();
router.get("/", asyncHandler(controller.list));
router.get("/:id/historique", asyncHandler(controller.history));
router.get("/:id", asyncHandler(controller.get));
router.post("/", allowRoles("Commercial", "Direction"), validate(validation.createSchema), asyncHandler(controller.create));
router.patch("/:id", allowRoles("Commercial", "Direction"), validate(validation.updateSchema), asyncHandler(controller.update));
router.delete("/:id", allowRoles("Direction"), asyncHandler(controller.remove));

module.exports = router;
