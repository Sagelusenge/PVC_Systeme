const router = require("express").Router();
const c = require("./rapport.controller");
const asyncHandler = require("../../utils/asyncHandler");
router.get("/", asyncHandler(c.list));
router.get("/:nom", asyncHandler(c.get));
module.exports = router;
