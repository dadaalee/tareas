const express = require("express");
const clientesController = require("../controllers/clientesController");
const productosController = require("../controllers/productosController");
const pedidosController = require("../controllers/pedidosController");
const ventasController = require("../controllers/ventasController");


function createRoutes(sequelize, models) {
  const router = express.Router();
  const clientes = clientesController(models);
  const productos = productosController(models);
  const pedidos = pedidosController(sequelize, models);
  const ventas = ventasController(sequelize, models);

  router.route("/clientes").get(clientes.listar).post(clientes.crear);
  router
    .route("/clientes/:id")
    .get(clientes.obtener)
    .put(clientes.actualizar)
    .delete(clientes.eliminar);

  router.route("/productos").get(productos.listar).post(productos.crear);
  router
    .route("/productos/:id")
    .get(productos.obtener)
    .put(productos.actualizar)
    .delete(productos.eliminar);

  router.route("/pedidos").get(pedidos.listar).post(pedidos.crear);
  router.route("/pedidos/:id").get(pedidos.obtener).delete(pedidos.eliminar);

  router.route("/ventas").get(ventas.listar).post(ventas.crear);
  router.route("/ventas/:id").get(ventas.obtener);

  return router;
}


module.exports = { createRoutes };
