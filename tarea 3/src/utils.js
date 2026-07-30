function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}


function isNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}


function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}


function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}


function sqliteErrorResponse(error, res) {
  if (error.code === "ERR_SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(409).json({ error: "El registro ya existe" });
  }

  if (error.code === "ERR_SQLITE_CONSTRAINT_FOREIGNKEY") {
    return res.status(409).json({
      error: "El registro está relacionado con otros datos y no puede eliminarse",
    });
  }

  throw error;
}


module.exports = {
  isNonNegativeNumber,
  isPositiveInteger,
  isValidDate,
  roundMoney,
  sqliteErrorResponse,
};
