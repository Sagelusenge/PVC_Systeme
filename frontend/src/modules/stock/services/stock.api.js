import { get, post, patch } from "../../../services/api";
export const listMaterials = () => get("/stock/matieres?limit=100");
export const listMovements = () => get("/stock/mouvements");
export const listAlerts = () => get("/stock/alertes");
export const createMaterial = (data) => post("/stock/matieres", data);
export const updateMaterial = (id, data) => patch(`/stock/matieres/${id}`, data);
export const createEntry = (data) => post("/stock/entrees", data);
export const createExit = (data) => post("/stock/sorties", data);
