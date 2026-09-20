import{get}from"../../../services/api";export const listReports=()=>get("/rapports");export const getReport=name=>get(`/rapports/${name}`);
