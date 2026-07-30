const db = require('../database/database');

const listar = () => db.all('SELECT * FROM ventas ORDER BY id_venta');
const obtener = (id) => db.get('SELECT * FROM ventas WHERE id_venta = ?', [id]);
const crear = (venta) =>
  db.run(
    `INSERT INTO ventas
      (id_pedido, id_cliente, id_producto, fecha, cantidad,
       precio_unitario, total, descuento)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      venta.id_pedido,
      venta.id_cliente,
      venta.id_producto,
      venta.fecha,
      venta.cantidad,
      venta.precio_unitario,
      venta.total,
      venta.descuento
    ]
  );

module.exports = { listar, obtener, crear };
