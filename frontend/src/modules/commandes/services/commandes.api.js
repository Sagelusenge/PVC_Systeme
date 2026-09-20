import { get, post } from "../../../services/api";
export const listOrders=()=>get("/commandes?limit=100"); export const createOrder=(data)=>post("/commandes",data);
