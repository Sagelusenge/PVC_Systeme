import { get } from "../../../services/api";
export const getDashboard = () => get("/dashboard");
export const getJournal = () => get("/comptabilite/journal-operations");
export const getStockAlerts = () => get("/stock/alertes");
