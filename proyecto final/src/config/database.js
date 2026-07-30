const { mkdirSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { Sequelize } = require("sequelize");


function createSequelize(
  storage = process.env.DB_FILE || "data/cine-los-patitos.db",
) {
  const databasePath = storage === ":memory:" ? storage : resolve(storage);

  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  return new Sequelize({
    dialect: "sqlite",
    storage: databasePath,
    logging: false,
  });
}


module.exports = { createSequelize };
