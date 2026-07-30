const express = require("express");
const {
  isNonNegativeNumber,
  isPositiveInteger,
  isValidDate,
  roundMoney,
} = require("../utils");


function ventasRoutes(db) {
  const router = express.Router();

  const selectVenta = db.prepare(`
    SELECT
      v.id_venta,
      v.id_pedido,
      v.id_cliente,
      cl.nombre AS cliente,
      v.id_producto,
      pr.producto,
      v.fecha,
      v.cantidad,
      v.precio_unitario,
      v.total,
      v.descuento
    FROM ventas v
    INNER JOIN clientes cl ON cl.id_cliente = v.id_cliente
    INNER JOIN productos pr ON pr.id_producto = v.id_producto
    WHERE v.id_venta = ?
  `);

  router.get("/", (req, res) => {
    const ventas = db
      .prepare(`
        SELECT
          v.id_venta,
          v.id_pedido,
          v.id_cliente,
          cl.nombre AS cliente,
          v.id_producto,
          pr.producto,
          v.fecha,
          v.cantidad,
          v.precio_unitario,
          v.total,
          v.descuento
        FROM ventas v
        INNER JOIN clientes cl ON cl.id_cliente = v.id_cliente
        INNER JOIN productos pr ON pr.id_producto = v.id_producto
        ORDER BY v.id_venta
      `)
      .all();

    res.json(ventas);
  });

  router.get("/:id", (req, res) => {
    const venta = selectVenta.get(req.params.id);

    if (!venta) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    res.json(venta);
  });

  router.post("/", (req, res) => {
    const {
      id_pedido,
      descuento = 0,
      fecha = new Date().toISOString().slice(0, 10),
    } = req.body;

    if (
      !isPositiveInteger(id_pedido) ||
      !isNonNegativeNumber(descuento) ||
      descuento > 100 ||
      !isValidDate(fecha)
    ) {
      return res.status(400).json({
        error:
          "id_pedido debe ser positivo, descuento debe estar entre 0 y 100 y fecha debe usar AAAA-MM-DD",
      });
    }

    db.exec("BEGIN IMMEDIATE");

    try {
      const pedido = db
        .prepare(`
          SELECT pe.*, pr.precio_venta
          FROM pedidos pe
          INNER JOIN productos pr ON pr.id_producto = pe.id_producto
          WHERE pe.id_pedido = ?
        `)
        .get(id_pedido);

      if (!pedido) {
        db.exec("ROLLBACK");
        return res.status(404).json({ error: "Pedido no encontrado" });
      }

      const existente = db
        .prepare("SELECT id_venta FROM ventas WHERE id_pedido = ?")
        .get(id_pedido);

      if (existente) {
        db.exec("ROLLBACK");
        return res.status(409).json({
          error: "El pedido ya tiene una venta registrada",
        });
      }

      const subtotal = pedido.cantidad * pedido.precio_venta;
      const total = roundMoney(subtotal * (1 - descuento / 100));

      const result = db
        .prepare(`
          INSERT INTO ventas (
            id_pedido,
            id_cliente,
            id_producto,
            fecha,
            cantidad,
            precio_unitario,
            total,
            descuento
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          id_pedido,
          pedido.id_cliente,
          pedido.id_producto,
          fecha,
          pedido.cantidad,
          pedido.precio_venta,
          total,
          descuento,
        );

      db.exec("COMMIT");

      const venta = selectVenta.get(result.lastInsertRowid);
      res.status(201).json(venta);
    } catch (error) {
      if (db.isTransaction) {
        db.exec("ROLLBACK");
      }
      throw error;
    }
  });

  return router;
}


module.exports = ventasRoutes;
