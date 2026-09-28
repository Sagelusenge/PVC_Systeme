import { get, patch, post, remove } from "../../../services/api";

export const listAssets = () => get("/immobilisations/materiels?limit=100");
export const listPlans = () => get("/immobilisations/plans");
export const getAssetPlan = (id) => get(`/immobilisations/materiels/${id}/plan`);
export const createAsset = (data) => post("/immobilisations/materiels", data);
export const updateAsset = (id, data) => patch(`/immobilisations/materiels/${id}`, data);
export const deleteAsset = (id) => remove(`/immobilisations/materiels/${id}`);
