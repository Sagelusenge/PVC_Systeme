import { get, patch, post, remove } from "../../../services/api";

export const listOrders = () => get("/commandes?limit=100");
export const getOrder = (id) => get(`/commandes/${id}`);
export const createOrder = (data) => post("/commandes", data);
export const updateOrder = (id, data) => patch(`/commandes/${id}`, data);
export const deliverOrder = (id) => post(`/commandes/${id}/livrer`, {});
export const deleteOrder = (id) => remove(`/commandes/${id}`);
