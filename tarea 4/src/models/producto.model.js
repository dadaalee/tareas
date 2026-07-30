const db = require('../database/database');

const listar = () => db.all('SELECT * FROM productos ORDER BY id_producto');
const obtener = (id) => db.get('SELECT * FROM productos WHERE id_producto = ?', [id]);
const crear = (producto) =>
  db.run(
    `INSERT INTO productos (producto, precio_compra, precio_venta, stock)
     VALUES (?, ?, ?, ?)`,
    [producto.producto, producto.precio_compra, producto.precio_venta, producto.stock]
  );
const actualizar = (id, producto) =>
  db.run(
    `UPDATE productos
     SET producto = ?, precio_compra = ?, precio_venta = ?, stock = ?
     WHERE id_producto = ?`,
    [producto.producto, producto.precio_compra, producto.precio_venta, producto.stock, id]
  );
const actualizarStock = (id, stock) =>
  db.run('UPDATE productos SET stock = ? WHERE id_producto = ?', [stock, id]);
const eliminar = (id) => db.run('DELETE FROM productos WHERE id_producto = ?', [id]);
const tienePedidos = async (id) =>
  Boolean(await db.get('SELECT 1 FROM pedidos WHERE id_producto = ? LIMIT 1', [id]));

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  actualizarStock,
  eliminar,
  tienePedidos
};
