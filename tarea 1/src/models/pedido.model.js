const db = require('../database/database');

const selectExpandido = `
  SELECT p.*, c.nombre AS cliente, pr.producto
  FROM pedidos p
  JOIN clientes c ON c.id_cliente = p.id_cliente
  JOIN productos pr ON pr.id_producto = p.id_producto
`;

const listar = () => db.all(`${selectExpandido} ORDER BY p.id_pedido`);
const obtener = (id) => db.get(`${selectExpandido} WHERE p.id_pedido = ?`, [id]);
const obtenerSimple = (id) => db.get('SELECT * FROM pedidos WHERE id_pedido = ?', [id]);
const crear = (pedido) =>
  db.run(
    `INSERT INTO pedidos (id_producto, id_cliente, cantidad, estado)
     VALUES (?, ?, ?, 'pendiente')`,
    [pedido.id_producto, pedido.id_cliente, pedido.cantidad]
  );
const actualizarCantidad = (id, cantidad) =>
  db.run('UPDATE pedidos SET cantidad = ? WHERE id_pedido = ?', [cantidad, id]);
const marcarVendido = (id) =>
  db.run("UPDATE pedidos SET estado = 'vendido' WHERE id_pedido = ?", [id]);
const eliminar = (id) => db.run('DELETE FROM pedidos WHERE id_pedido = ?', [id]);

module.exports = {
  listar,
  obtener,
  obtenerSimple,
  crear,
  actualizarCantidad,
  marcarVendido,
  eliminar
};
