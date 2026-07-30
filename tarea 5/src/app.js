const express = require("express");
const { createSequelize } = require("./config/database");
const { defineModels } = require("./models");
const { createRoutes } = require("./routes");


async function createApp(options = {}) {
  const sequelize = createSequelize(options.storage);
  const models = defineModels(sequelize);

  await sequelize.authenticate();
  await sequelize.sync({ force: options.force === true });

  const app = express();
  app.locals.sequelize = sequelize;
  app.locals.models = models;

  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({
      aplicacion: "Tarea 5 - API de ventas con Sequelize ORM",
      orm: "Sequelize",
      dialecto: "SQLite",
      endpoints: {
        clientes: "/api/clientes",
        productos: "/api/productos",
        pedidos: "/api/pedidos",
        ventas: "/api/ventas",
        estado: "/api/health",
      },
    });
  });

  app.get("/api/health", async (req, res) => {
    await sequelize.authenticate();
    res.json({
      estado: "ok",
      orm: "Sequelize",
      base_de_datos: "conectada",
    });
  });

  app.use("/api", createRoutes(sequelize, models));

  app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  });

  return app;
}


module.exports = { createApp };
