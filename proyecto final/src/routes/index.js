const express = require("express");
const usuariosController = require("../controllers/usuariosController");
const clientesController = require("../controllers/clientesController");
const peliculasController = require("../controllers/peliculasController");
const salasController = require("../controllers/salasController");
const programacionesController = require("../controllers/programacionesController");
const candybarController = require("../controllers/candybarController");


function attachCrud(router, path, controller) {
  router.route(path).get(controller.listar).post(controller.crear);
  router
    .route(`${path}/:id`)
    .get(controller.obtener)
    .put(controller.actualizar)
    .delete(controller.eliminar);
}


function createRoutes(sequelize, models) {
  const router = express.Router();

  attachCrud(router, "/usuarios", usuariosController(models));
  attachCrud(router, "/clientes", clientesController(models));
  attachCrud(router, "/peliculas", peliculasController(models));
  attachCrud(router, "/salas", salasController(models));
  attachCrud(
    router,
    "/programaciones",
    programacionesController(sequelize, models),
  );
  attachCrud(router, "/candybar", candybarController(models));

  return router;
}


module.exports = { createRoutes };
