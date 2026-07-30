const express = require("express");
const { isValidDate, sqliteErrorResponse } = require("../utils");


function clientesRoutes(db) {
  const router = express.Router();

  router.get("/", (req, res) => {
    const clientes = db.prepare("SELECT * FROM clientes ORDER BY id_cliente").all();
    res.json(clientes);
  });

  router.get("/:id", (req, res) => {
    const cliente = db
      .prepare("SELECT * FROM clientes WHERE id_cliente = ?")
      .get(req.params.id);

    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(cliente);
  });

  router.post("/", (req, res) => {
    const { nombre, nit, fecha_nac } = req.body;

    if (
      typeof nombre !== "string" ||
      !nombre.trim() ||
      typeof nit !== "string" ||
      !nit.trim() ||
      !isValidDate(fecha_nac)
    ) {
      return res.status(400).json({
        error: "nombre, nit y fecha_nac (AAAA-MM-DD) son obligatorios",
      });
    }

    try {
      const result = db
        .prepare("INSERT INTO clientes (nombre, nit, fecha_nac) VALUES (?, ?, ?)")
        .run(nombre.trim(), nit.trim(), fecha_nac);

      const cliente = db
        .prepare("SELECT * FROM clientes WHERE id_cliente = ?")
        .get(result.lastInsertRowid);

      res.status(201).json(cliente);
    } catch (error) {
      return sqliteErrorResponse(error, res);
    }
  });

  router.put("/:id", (req, res) => {
    const { nombre, nit, fecha_nac } = req.body;

    if (
      typeof nombre !== "string" ||
      !nombre.trim() ||
      typeof nit !== "string" ||
      !nit.trim() ||
      !isValidDate(fecha_nac)
    ) {
      return res.status(400).json({
        error: "nombre, nit y fecha_nac (AAAA-MM-DD) son obligatorios",
      });
    }

    try {
      const result = db
        .prepare(
          `UPDATE clientes
           SET nombre = ?, nit = ?, fecha_nac = ?
           WHERE id_cliente = ?`,
        )
        .run(nombre.trim(), nit.trim(), fecha_nac, req.params.id);

      if (result.changes === 0) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      const cliente = db
        .prepare("SELECT * FROM clientes WHERE id_cliente = ?")
        .get(req.params.id);

      res.json(cliente);
    } catch (error) {
      return sqliteErrorResponse(error, res);
    }
  });

  router.delete("/:id", (req, res) => {
    try {
      const result = db
        .prepare("DELETE FROM clientes WHERE id_cliente = ?")
        .run(req.params.id);

      if (result.changes === 0) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      res.status(204).send();
    } catch (error) {
      return sqliteErrorResponse(error, res);
    }
  });

  return router;
}


module.exports = clientesRoutes;
