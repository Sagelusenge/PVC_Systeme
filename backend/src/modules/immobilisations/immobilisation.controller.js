const s = require("./immobilisation.service");
const crud = require("../../shared/crud.controller");
const { success } = require("../../utils/response");
module.exports = {
  materials: crud(s.materials, "Materiel"),
  plan: async (req, res) => success(res, await s.plan(req.params.id)),
  allPlans: async (req, res) => success(res, await s.allPlans()),
};
