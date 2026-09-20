const service = require("./rapport.service");
const { success } = require("../../utils/response");
async function get(req, res) { return success(res, await service.get(req.params.nom)); }
async function list(req, res) { return success(res, service.names); }
module.exports = { get, list };
