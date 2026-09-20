const { query } = require("../config/database");

function auditMiddleware(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  res.on("finish", () => {
    if (!req.user || res.statusCode >= 400) return;
    query(
      `INSERT INTO taudit_logs (utilisateur_id, action, route, methode, adresse_ip)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, `${req.method} ${req.baseUrl}${req.path}`, req.originalUrl, req.method, req.ip]
    ).catch((error) => console.error("Audit log failed:", error.message));
  });

  return next();
}

module.exports = auditMiddleware;
