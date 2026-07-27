const db = require('../database/database');

const listar = () => db.all('SELECT * FROM clientes ORDER BY id_cliente');
const obtener = (id) => db.get('SELECT * FROM clientes WHERE id_cliente = ?', [id]);
const buscarPorNit = (nit) => db.get('SELECT * FROM clientes WHERE nit = ?', [nit]);
const crear = (cliente) =>
  db.run('INSERT INTO clientes (nombre, nit, fecha_nac) VALUES (?, ?, ?)', [
    cliente.nombre,
    cliente.nit,
    cliente.fecha_nac
  ]);
const actualizar = (id, cliente) =>
  db.run(
    'UPDATE clientes SET nombre = ?, nit = ?, fecha_nac = ? WHERE id_cliente = ?',
    [cliente.nombre, cliente.nit, cliente.fecha_nac, id]
  );
const eliminar = (id) => db.run('DELETE FROM clientes WHERE id_cliente = ?', [id]);
const tienePedidos = async (id) =>
  Boolean(await db.get('SELECT 1 FROM pedidos WHERE id_cliente = ? LIMIT 1', [id]));

module.exports = { listar, obtener, buscarPorNit, crear, actualizar, eliminar, tienePedidos };
