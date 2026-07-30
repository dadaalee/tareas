const express = require("express");
const { createSequelize } = require("./config/database");
const { defineModels } = require("./models");
const { createRoutes } = require("./routes");


async function createApp(options = {}) {
  const sequelize = createSequelize(options.storage);
  const models = defineModels(sequelize);

  await sequelize.authenticate();
  await sequelize.query("PRAGMA foreign_keys = ON");
  await sequelize.sync({ force: options.force === true });

  const app = express();
  app.locals.sequelize = sequelize;
  app.locals.models = models;

  app.use(express.json({ limit: "1mb" }));

  app.get("/", (req, res) => {
    res.json({
      proyecto: "Backend del Cine Los Patitos",
      tecnologia: "Node.js + Express + Sequelize ORM",
      dialecto: "SQLite",
      version: "1.0.0",
      endpoints: {
        usuarios: "/api/usuarios",
        clientes: "/api/clientes",
        peliculas: "/api/peliculas",
        salas: "/api/salas",
        programaciones: "/api/programaciones",
        candybar: "/api/candybar",
        estado: "/api/health",
      },
      operaciones: ["listar", "buscar por ID", "crear", "actualizar", "eliminar"],
    });
  });

  app.get("/api/health", async (req, res) => {
    await sequelize.authenticate();
    res.json({
      estado: "ok",
      proyecto: "Cine Los Patitos",
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
