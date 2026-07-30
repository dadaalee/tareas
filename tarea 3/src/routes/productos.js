const express = require("express");
const {
  isNonNegativeNumber,
  sqliteErrorResponse,
} = require("../utils");


function productosRoutes(db) {
  const router = express.Router();

  router.get("/", (req, res) => {
    const productos = db
      .prepare("SELECT * FROM productos ORDER BY id_producto")
      .all();
    res.json(productos);
  });

  router.get("/:id", (req, res) => {
    const producto = db
      .prepare("SELECT * FROM productos WHERE id_producto = ?")
      .get(req.params.id);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  });

  router.post("/", (req, res) => {
    const { producto, precio_compra, precio_venta, stock } = req.body;

    if (
      typeof producto !== "string" ||
      !producto.trim() ||
      !isNonNegativeNumber(precio_compra) ||
      !isNonNegativeNumber(precio_venta) ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return res.status(400).json({
        error:
          "producto, precios no negativos y stock entero no negativo son obligatorios",
      });
    }

    const result = db
      .prepare(
        `INSERT INTO productos
          (producto, precio_compra, precio_venta, stock)
         VALUES (?, ?, ?, ?)`,
      )
      .run(producto.trim(), precio_compra, precio_venta, stock);

    const creado = db
      .prepare("SELECT * FROM productos WHERE id_producto = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(creado);
  });

  router.put("/:id", (req, res) => {
    const { producto, precio_compra, precio_venta, stock } = req.body;

    if (
      typeof producto !== "string" ||
      !producto.trim() ||
      !isNonNegativeNumber(precio_compra) ||
      !isNonNegativeNumber(precio_venta) ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return res.status(400).json({
        error:
          "producto, precios no negativos y stock entero no negativo son obligatorios",
      });
    }

    const result = db
      .prepare(
        `UPDATE productos
         SET producto = ?, precio_compra = ?, precio_venta = ?, stock = ?
         WHERE id_producto = ?`,
      )
      .run(producto.trim(), precio_compra, precio_venta, stock, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const actualizado = db
      .prepare("SELECT * FROM productos WHERE id_producto = ?")
      .get(req.params.id);

    res.json(actualizado);
  });

  router.delete("/:id", (req, res) => {
    try {
      const result = db
        .prepare("DELETE FROM productos WHERE id_producto = ?")
        .run(req.params.id);

      if (result.changes === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      res.status(204).send();
    } catch (error) {
      return sqliteErrorResponse(error, res);
    }
  });

  return router;
}


module.exports = productosRoutes;
