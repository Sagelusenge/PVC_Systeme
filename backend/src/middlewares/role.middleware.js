const ApiError = require("../utils/ApiError");

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Authentification requise"));
    if (req.user.nom_role === "Administrateur" || roles.includes(req.user.nom_role)) return next();
    return next(new ApiError(403, "Vous n'avez pas les droits pour cette action"));
  };
}

module.exports = allowRoles;
