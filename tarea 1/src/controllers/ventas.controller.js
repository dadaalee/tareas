const db = require('../database/database');
const Pedido = require('../models/pedido.model');
const Producto = require('../models/producto.model');
const Venta = require('../models/venta.model');
const { isNonNegativeNumber, parseId } = require('../utils');

const httpError = (status, message) => Object.assign(new Error(message), { status });

const listar = async (req, res) => res.json(await Venta.listar());

const obtener = async (req, res) => {
  const venta = await Venta.obtener(parseId(req.params.id));
  if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
  res.json(venta);
};

const crear = async (req, res) => {
  const id_pedido = parseId(req.body.id_pedido);
  const descuento = req.body.descuento === undefined ? 0 : Number(req.body.descuento);
  if (!id_pedido) return res.status(400).json({ error: 'id_pedido es obligatorio' });
  if (!isNonNegativeNumber(descuento) || descuento > 100) {
    return res.status(400).json({ error: 'El descuento debe estar entre 0 y 100' });
  }

  try {
    const id = await db.transaction(async () => {
      const pedido = await Pedido.obtenerSimple(id_pedido);
      if (!pedido) throw httpError(404, 'Pedido no encontrado');
      if (pedido.estado === 'vendido') {
        throw httpError(409, 'El pedido ya tiene una venta registrada');
      }

      const producto = await Producto.obtener(pedido.id_producto);
      const precio_unitario = producto.precio_venta;
      const total = Number(
        (precio_unitario * pedido.cantidad * (1 - descuento / 100)).toFixed(2)
      );
      const venta = {
        id_pedido,
        id_cliente: pedido.id_cliente,
        id_producto: pedido.id_producto,
        fecha: new Date().toISOString(),
        cantidad: pedido.cantidad,
        precio_unitario,
        total,
        descuento
      };
      const result = await Venta.crear(venta);
      await Pedido.marcarVendido(id_pedido);
      return result.id;
    });
    res.status(201).json(await Venta.obtener(id));
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    throw error;
  }
};

module.exports = { listar, obtener, crear };
