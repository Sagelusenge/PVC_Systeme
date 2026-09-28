const repository = require("./commande.repository");
const createCrudService = require("../../shared/crud.service");
const ApiError = require("../../utils/ApiError");
const { nextCode } = require("../../utils/codes");

const service = createCrudService(repository, "Commande");
service.get = async (id) => {
  const order = await repository.findDetailed(id);
  if (!order) throw new ApiError(404, "Commande introuvable");
  return order;
};
service.create = async (data) => {
  const total = data.details.reduce(
    (sum, line) => sum + Number(line.quantite_commandee) * Number(line.prix_vente_unitaire),
    0
  );
  if (Number(data.montant_anticipation || 0) > total) {
    throw new ApiError(422, "L'acompte ne peut pas dépasser le total de la commande");
  }
  const numero = data.numero || await nextCode({
    table: "tcommandeclient", column: "numero", prefix: `CMD-${new Date().getFullYear()}-`, width: 4,
  });
  return service.get(await repository.createWithDetails({ ...data, numero }));
};
service.update = async (id, data) => {
  const current = await service.get(id);
  if (current.statut === "livrée") throw new ApiError(409, "Une commande livrée ne peut plus être modifiée");
  const total = data.details
    ? data.details.reduce((sum, line) => sum + Number(line.quantite_commandee) * Number(line.prix_vente_unitaire), 0)
    : Number(current.montant_tot);
  const advance = data.montant_anticipation === undefined
    ? Number(current.montant_anticipation || 0)
    : Number(data.montant_anticipation || 0);
  if (advance > total) throw new ApiError(422, "L'acompte ne peut pas dépasser le total de la commande");
  const updatedId = await repository.updateWithDetails(id, data);
  if (!updatedId) throw new ApiError(404, "Commande introuvable");
  return service.get(updatedId);
};
service.deliver = async (id, user) => {
  const result = await repository.deliver(id, user);
  if (result.error === "not_found") throw new ApiError(404, "Commande introuvable");
  if (result.error === "cancelled") throw new ApiError(409, "Une commande annulée ne peut pas être livrée");
  if (result.error === "already_delivered") throw new ApiError(409, `Cette commande est déjà liée à la vente ${result.saleId}`);
  if (result.error === "empty") throw new ApiError(422, "La commande ne contient aucun produit");
  if (result.error === "product_not_found") throw new ApiError(404, "Un produit de la commande est introuvable");
  if (result.error === "insufficient") throw new ApiError(409, `Stock insuffisant pour ${result.product.libelle}. Disponible: ${result.available}`);
  return { commande: await service.get(id), vente_id: result.saleId, paiement_id: result.paymentId };
};
const removeOrder = service.remove;
service.remove = async (id) => {
  const order = await service.get(id);
  if (order.vente_id || order.statut === "livrée") throw new ApiError(409, "Une commande déjà facturée ne peut pas être supprimée");
  return removeOrder(id);
};

module.exports = service;
