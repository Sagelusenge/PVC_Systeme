const env = require("../config/env");

function errorMiddleware(error, req, res, next) {
  let statusCode = error.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = error.message || "Erreur interne du serveur";

  if (error.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "Cette valeur existe deja";
  } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 422;
    message = "Une ressource associee est introuvable";
  } else if (error.code === "ER_ROW_IS_REFERENCED_2") {
    statusCode = 409;
    message = "Cette ressource est encore utilisee et ne peut pas etre supprimee";
  }

  res.status(statusCode).json({
    status: "error",
    message,
    details: error.details,
    stack: env.nodeEnv === "production" ? undefined : error.stack,
  });
}

module.exports = errorMiddleware;
