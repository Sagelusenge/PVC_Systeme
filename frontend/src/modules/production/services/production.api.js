import { get, post } from "../../../services/api";
export const listProducts=()=>get("/production/produits?limit=100");
export const listProductionEntries=()=>get("/production/entrees?limit=100");
export const createProduct=(data)=>post("/production/produits",data);
export const createProductionEntry=(data)=>post("/production/entrees",data);
