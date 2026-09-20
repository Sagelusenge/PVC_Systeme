const express = require("express");
const controller = require("./auth.controller");
const { loginSchema, profileSchema } = require("./auth.validation");
const validate = require("../../middlewares/validation.middleware");
const auth = require("../../middlewares/auth.middleware");
const asyncHandler = require("../../utils/asyncHandler");

const router = express.Router();

router.post("/login", validate(loginSchema), asyncHandler(controller.login));
router.get("/me", auth, asyncHandler(controller.me));
router.patch("/me", auth, validate(profileSchema), asyncHandler(controller.updateProfile));
router.post("/logout", auth, (req, res) => res.status(204).send());

module.exports = router;
