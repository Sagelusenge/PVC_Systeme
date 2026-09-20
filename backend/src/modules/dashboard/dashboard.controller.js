const service = require("./dashboard.service");
const { success } = require("../../utils/response");
async function overview(req, res) { return success(res, await service.overview()); }
module.exports = { overview };
