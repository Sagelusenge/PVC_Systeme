const repository = require("./rapport.repository");
const ApiError = require("../../utils/ApiError");
async function get(name) {
  const rows = await repository.get(name);
  if (!rows) throw new ApiError(404, "Rapport inconnu");
  return rows;
}
module.exports = { get, names: repository.names };
