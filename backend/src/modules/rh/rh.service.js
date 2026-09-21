const r = require("./rh.repository");
const crud = require("../../shared/crud.service");
const ApiError = require("../../utils/ApiError");
const payrollPayments = crud(r.payrollPayments, "Paiement de salaire");
async function createPayroll(data) {
  try {
    const payment = await r.createPayroll(data);
    if (!payment) throw new ApiError(404, "Agent ou salaire introuvable");
    return payment;
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") throw new ApiError(409, "La paie de cet agent existe deja pour cette periode");
    throw error;
  }
}
module.exports = {
  personnel: crud(r.personnel, "Personnel"), postes: crud(r.postes, "Poste"), affectations: crud(r.affectations, "Affectation"),
  presences: crud(r.presences, "Presence"), conges: crud(r.conges, "Conge"), demandesConges: crud(r.demandesConges, "Demande de conge"),
  retenues: crud(r.retenues, "Retenue"), agentRetenues: crud(r.agentRetenues, "Retenue agent"), avantages: crud(r.avantages, "Avantage"),
  agentAvantages: crud(r.agentAvantages, "Avantage agent"), joursFeries: crud(r.joursFeries, "Jour ferie"), payroll: r.payroll,
  payrollPayments, createPayroll,
};
