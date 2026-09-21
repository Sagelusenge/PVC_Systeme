import { get, patch, post, remove } from "../../../services/api";
export const listProducts=()=>get("/production/produits?limit=100");
export const listProductionEntries=()=>get("/production/entrees?limit=100");
export const createProduct=(data)=>post("/production/produits",data);
export const updateProduct=(id,data)=>patch(`/production/produits/${id}`,data);
export const deleteProduct=(id)=>remove(`/production/produits/${id}`);
export const createProductionEntry=(data)=>post("/production/entrees",data);
