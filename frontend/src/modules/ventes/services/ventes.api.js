import { get, post } from "../../../services/api";
export const listSales=()=>get("/ventes?limit=100"); export const listPayments=()=>get("/paiements?limit=100"); export const listClients=()=>get("/clients?limit=100"); export const listProducts=()=>get("/production/produits?limit=100");
export const createSale=(data)=>post("/ventes",data); export const createPayment=(data)=>post("/paiements",data);
