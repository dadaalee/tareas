const express = require("express");
const { createDatabase } = require("./database");
const clientesRoutes = require("./routes/clientes");
const productosRoutes = require("./routes/productos");
const pedidosRoutes = require("./routes/pedidos");
const ventasRoutes = require("./routes/ventas");


function createApp(databaseFile) {
  const app = express();
  const db = createDatabase(databaseFile);

  app.locals.db = db;
  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({
      aplicacion: "Tarea 3 - API de ventas",
      endpoints: {
        clientes: "/api/clientes",
        productos: "/api/productos",
        pedidos: "/api/pedidos",
        ventas: "/api/ventas",
        estado: "/api/health",
      },
    });
  });

  app.get("/api/health", (req, res) => {
    res.json({ estado: "ok", base_de_datos: "conectada" });
  });

  app.use("/api/clientes", clientesRoutes(db));
  app.use("/api/productos", productosRoutes(db));
  app.use("/api/pedidos", pedidosRoutes(db));
  app.use("/api/ventas", ventasRoutes(db));

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
