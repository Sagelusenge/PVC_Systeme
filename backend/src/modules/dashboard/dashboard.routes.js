const router = require("express").Router();
const controller = require("./dashboard.controller");
const asyncHandler = require("../../utils/asyncHandler");
router.get("/", asyncHandler(controller.overview));
module.exports = router;
