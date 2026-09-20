const s = require("./rh.service");
const crud = require("../../shared/crud.controller");
const { success } = require("../../utils/response");
module.exports = {
  personnel: crud(s.personnel, "Personnel"), postes: crud(s.postes, "Poste"), affectations: crud(s.affectations, "Affectation"),
  presences: crud(s.presences, "Presence"), conges: crud(s.conges, "Conge"), demandesConges: crud(s.demandesConges, "Demande de conge"),
  retenues: crud(s.retenues, "Retenue"), agentRetenues: crud(s.agentRetenues, "Retenue agent"), avantages: crud(s.avantages, "Avantage"),
  agentAvantages: crud(s.agentAvantages, "Avantage agent"), joursFeries: crud(s.joursFeries, "Jour ferie"),
  payroll: async (req, res) => success(res, await s.payroll()),
};
