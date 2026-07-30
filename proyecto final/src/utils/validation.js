function isNonEmptyString(value) {
  return typeof value === "string" && Boolean(value.trim());
}


function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}


function isNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}


function isValidDate(value, optional = false) {
  if (optional && (value === null || value === undefined || value === "")) {
    return true;
  }
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}


function isValidTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}


function timeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}


module.exports = {
  isNonEmptyString,
  isNonNegativeNumber,
  isPositiveInteger,
  isValidDate,
  isValidTime,
  timeToMinutes,
};
