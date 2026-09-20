const express = require("express");
const c = require("./rh.controller");
const v = require("./rh.validation");
const validate = require("../../middlewares/validation.middleware");
const allowRoles = require("../../middlewares/role.middleware");
const asyncHandler = require("../../utils/asyncHandler");
const router = express.Router();
const manage = allowRoles("RH", "Direction");
function mount(path, name, required = []) {
  const controller = c[name];
  router.get(path, asyncHandler(controller.list)); router.get(`${path}/:id`, asyncHandler(controller.get));
  router.post(path, manage, validate(v.create(name, required)), asyncHandler(controller.create));
  router.patch(`${path}/:id`, manage, validate(v.update(name)), asyncHandler(controller.update));
}
router.get("/paie", asyncHandler(c.payroll));
mount("/personnel", "personnel", ["nom"]); mount("/postes", "postes", ["nom_poste", "salaire_mensuel"]);
mount("/affectations", "affectations", ["id_perso", "poste_id", "date_affectation"]); mount("/presences", "presences", ["id_agent", "heure_arrivee"]);
mount("/conges", "conges", ["libelle", "jours_max"]); mount("/demandes-conges", "demandesConges", ["id_agent", "idconge", "date_debut", "date_fin"]);
mount("/retenues", "retenues", ["libelle"]); mount("/agent-retenues", "agentRetenues", ["id_agent", "id_retenue", "montant"]);
mount("/avantages", "avantages", ["libelle"]); mount("/agent-avantages", "agentAvantages", ["id_agent", "id_avantage", "montant"]);
mount("/jours-feries", "joursFeries", ["date_ferie", "description"]);
module.exports = router;
