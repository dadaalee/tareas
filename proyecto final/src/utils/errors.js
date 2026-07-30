const {
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError,
} = require("sequelize");


function sendSequelizeError(error, res) {
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({
      error: "Ya existe un registro con uno de los valores únicos enviados",
    });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      error: "El registro está relacionado con otros datos",
    });
  }
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: "Datos inválidos",
      detalles: error.errors.map((item) => item.message),
    });
  }
  throw error;
}


module.exports = { sendSequelizeError };
