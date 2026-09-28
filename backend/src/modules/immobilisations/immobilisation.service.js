const r = require("./immobilisation.repository");
const crud = require("../../shared/crud.service");
const { nextCode } = require("../../utils/codes");
const materials = crud(r.materials, "Materiel");
const createMaterial = materials.create;
materials.create = async (data) => createMaterial({
  ...data,
  code_materiel: data.code_materiel || await nextCode({ table: "tmateriels", column: "code_materiel", prefix: "MAT-" }),
});
materials.remove = async (id) => {
  await materials.get(id);
  return r.removeMaterial(id);
};
module.exports = { materials, plan: async (id) => { await materials.get(id); return r.plan(id); }, allPlans: r.allPlans };
