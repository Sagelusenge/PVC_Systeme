const { query } = require("../config/database");
const { verifyToken } = require("../utils/jwt");
const ApiError = require("../utils/ApiError");

async function authMiddleware(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Token d'authentification requis");
    }

    const payload = verifyToken(token);
    const rows = await query(
      `SELECT u.id, u.nom_utilisateur, u.email, u.photo_url, u.statut, u.role_id, r.nom_role, r.statut AS role_statut
       FROM tutilisateurs u
       LEFT JOIN troles r ON r.id = u.role_id
       WHERE u.id = ? LIMIT 1`,
      [payload.sub]
    );

    const user = rows[0];
    if (!user || user.statut !== "Actif") {
      throw new ApiError(401, "Compte utilisateur invalide ou inactif");
    }
    if (user.role_statut === "Inactif") {
      throw new ApiError(403, "Le role de ce compte est bloque");
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") return next(new ApiError(401, "Token expire"));
    if (error.name === "JsonWebTokenError") return next(new ApiError(401, "Token invalide"));
    return next(error);
  }
}

module.exports = authMiddleware;
