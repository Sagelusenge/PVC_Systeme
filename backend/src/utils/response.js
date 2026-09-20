function success(res, data, message = "Operation reussie", statusCode = 200, meta) {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

module.exports = { success };
