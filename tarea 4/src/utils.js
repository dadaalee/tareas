const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;
const isNonNegativeNumber = (value) =>
  value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0;

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

module.exports = { isPositiveInteger, isNonNegativeNumber, parseId, validDate };
