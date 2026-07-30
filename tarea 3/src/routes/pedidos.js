const express = require("express");
const { isPositiveInteger } = require("../utils");


function pedidosRoutes(db) {
  const router = express.Router();

  const selectPedido = db.prepare(`
    SELECT
      pe.id_pedido,
      pe.id_producto,
      pr.producto,
      pe.id_cliente,
      cl.nombre AS cliente,
      pe.cantidad
    FROM pedidos pe
    INNER JOIN productos pr ON pr.id_producto = pe.id_producto
    INNER JOIN clientes cl ON cl.id_cliente = pe.id_cliente
    WHERE pe.id_pedido = ?
  `);

  router.get("/", (req, res) => {
    const pedidos = db
      .prepare(`
        SELECT
          pe.id_pedido,
          pe.id_producto,
          pr.producto,
          pe.id_cliente,
          cl.nombre AS cliente,
          pe.cantidad
        FROM pedidos pe
        INNER JOIN productos pr ON pr.id_producto = pe.id_producto
        INNER JOIN clientes cl ON cl.id_cliente = pe.id_cliente
        ORDER BY pe.id_pedido
      `)
      .all();

    res.json(pedidos);
  });

  router.get("/:id", (req, res) => {
    const pedido = selectPedido.get(req.params.id);

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json(pedido);
  });

  router.post("/", (req, res) => {
    const { id_producto, id_cliente, cantidad } = req.body;

    if (
      !isPositiveInteger(id_producto) ||
      !isPositiveInteger(id_cliente) ||
      !isPositiveInteger(cantidad)
    ) {
      return res.status(400).json({
        error: "id_producto, id_cliente y cantidad deben ser enteros positivos",
      });
    }

    db.exec("BEGIN IMMEDIATE");

    try {
      const cliente = db
        .prepare("SELECT id_cliente FROM clientes WHERE id_cliente = ?")
        .get(id_cliente);
      const producto = db
        .prepare("SELECT * FROM productos WHERE id_producto = ?")
        .get(id_producto);

      if (!cliente) {
        db.exec("ROLLBACK");
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      if (!producto) {
        db.exec("ROLLBACK");
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      if (producto.stock < cantidad) {
        db.exec("ROLLBACK");
        return res.status(409).json({
          error: "Stock insuficiente",
          stock_actual: producto.stock,
          cantidad_solicitada: cantidad,
        });
      }

      const stockResult = db
        .prepare(
          `UPDATE productos
           SET stock = stock - ?
           WHERE id_producto = ? AND stock >= ?`,
        )
        .run(cantidad, id_producto, cantidad);

      if (stockResult.changes !== 1) {
        throw new Error("El stock cambió durante la operación");
      }

      const pedidoResult = db
        .prepare(
          `INSERT INTO pedidos (id_producto, id_cliente, cantidad)
           VALUES (?, ?, ?)`,
        )
        .run(id_producto, id_cliente, cantidad);

      db.exec("COMMIT");

      const pedido = selectPedido.get(pedidoResult.lastInsertRowid);
      res.status(201).json(pedido);
    } catch (error) {
      if (db.isTransaction) {
        db.exec("ROLLBACK");
      }
      throw error;
    }
  });

  router.delete("/:id", (req, res) => {
    db.exec("BEGIN IMMEDIATE");

    try {
      const pedido = db
        .prepare("SELECT * FROM pedidos WHERE id_pedido = ?")
        .get(req.params.id);

      if (!pedido) {
        db.exec("ROLLBACK");
        return res.status(404).json({ error: "Pedido no encontrado" });
      }

      const venta = db
        .prepare("SELECT id_venta FROM ventas WHERE id_pedido = ?")
        .get(req.params.id);

      if (venta) {
        db.exec("ROLLBACK");
        return res.status(409).json({
          error: "No se puede eliminar un pedido que ya fue vendido",
        });
      }

      db.prepare("DELETE FROM pedidos WHERE id_pedido = ?").run(req.params.id);
      db.prepare(
        "UPDATE productos SET stock = stock + ? WHERE id_producto = ?",
      ).run(pedido.cantidad, pedido.id_producto);

      db.exec("COMMIT");
      res.status(204).send();
    } catch (error) {
      if (db.isTransaction) {
        db.exec("ROLLBACK");
      }
      throw error;
    }
  });

  return router;
}


module.exports = pedidosRoutes;
