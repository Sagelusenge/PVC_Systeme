const r = require("./immobilisation.repository");
const crud = require("../../shared/crud.service");
const materials = crud(r.materials, "Materiel");
module.exports = { materials, plan: async (id) => { await materials.get(id); return r.plan(id); }, allPlans: r.allPlans };
