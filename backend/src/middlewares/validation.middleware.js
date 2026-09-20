const ApiError = require("../utils/ApiError");

function validate(schema, property = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return next(
        new ApiError(
          422,
          "Donnees invalides",
          error.details.map((item) => ({ field: item.path.join("."), message: item.message }))
        )
      );
    }

    req[property] = value;
    return next();
  };
}

module.exports = validate;
