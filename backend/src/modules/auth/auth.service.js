const repository = require("./auth.repository");
const ApiError = require("../../utils/ApiError");
const { signToken } = require("../../utils/jwt");
const { verifyPassword, hashPassword, isBcryptHash } = require("../../utils/password");

function sanitizeUser(user) {
  const { mot_de_passe, ...safeUser } = user;
  return safeUser;
}

async function login({ nom_utilisateur, mot_de_passe }) {
  const user = await repository.findByUsername(nom_utilisateur);
  if (!user || !(await verifyPassword(mot_de_passe, user.mot_de_passe))) {
    throw new ApiError(401, "Nom d'utilisateur ou mot de passe incorrect");
  }
  if (user.statut !== "Actif") throw new ApiError(403, "Ce compte est inactif");

  if (!isBcryptHash(user.mot_de_passe)) {
    await repository.updatePassword(user.id, await hashPassword(mot_de_passe));
  }

  const safeUser = sanitizeUser(user);
  return { token: signToken(safeUser), user: safeUser };
}

async function updateProfile(userId, data) {
  const user = await repository.findById(userId);
  if (!user) throw new ApiError(404, "Utilisateur introuvable");

  const payload = {
    nom_utilisateur: data.nom_utilisateur,
    email: data.email || null,
    photo_url: data.photo_url ?? user.photo_url,
  };

  if (data.nouveau_mot_de_passe) {
    if (!data.mot_de_passe_actuel || !(await verifyPassword(data.mot_de_passe_actuel, user.mot_de_passe))) {
      throw new ApiError(401, "Le mot de passe actuel est incorrect");
    }
    payload.mot_de_passe = await hashPassword(data.nouveau_mot_de_passe);
  }

  return sanitizeUser(await repository.updateProfile(userId, payload));
}

module.exports = { login, sanitizeUser, updateProfile };
