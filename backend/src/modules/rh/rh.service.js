const r = require("./rh.repository");
const crud = require("../../shared/crud.service");
module.exports = {
  personnel: crud(r.personnel, "Personnel"), postes: crud(r.postes, "Poste"), affectations: crud(r.affectations, "Affectation"),
  presences: crud(r.presences, "Presence"), conges: crud(r.conges, "Conge"), demandesConges: crud(r.demandesConges, "Demande de conge"),
  retenues: crud(r.retenues, "Retenue"), agentRetenues: crud(r.agentRetenues, "Retenue agent"), avantages: crud(r.avantages, "Avantage"),
  agentAvantages: crud(r.agentAvantages, "Avantage agent"), joursFeries: crud(r.joursFeries, "Jour ferie"), payroll: r.payroll,
};
