const db = require('../database/database');
const Cliente = require('../models/cliente.model');
const Producto = require('../models/producto.model');
const Pedido = require('../models/pedido.model');
const { isPositiveInteger, parseId } = require('../utils');

const httpError = (status, message, details = {}) =>
  Object.assign(new Error(message), { status, details });

const responderError = (res, error) => {
  if (!error.status) throw error;
  return res.status(error.status).json({ error: error.message, ...error.details });
};

const listar = async (req, res) => res.json(await Pedido.listar());

const obtener = async (req, res) => {
  const pedido = await Pedido.obtener(parseId(req.params.id));
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
  res.json(pedido);
};

const crear = async (req, res) => {
  const id_cliente = parseId(req.body.id_cliente);
  const id_producto = parseId(req.body.id_producto);
  const cantidad = Number(req.body.cantidad);

  if (!id_cliente || !id_producto || !isPositiveInteger(cantidad)) {
    return res.status(400).json({
      error: 'id_cliente, id_producto y cantidad entera positiva son obligatorios'
    });
  }

  try {
    const id = await db.transaction(async () => {
      if (!(await Cliente.obtener(id_cliente))) {
        throw httpError(404, 'Cliente no encontrado');
      }
      const producto = await Producto.obtener(id_producto);
      if (!producto) throw httpError(404, 'Producto no encontrado');
      if (producto.stock < cantidad) {
        throw httpError(409, 'Stock insuficiente', {
          stock_disponible: producto.stock,
          cantidad_solicitada: cantidad
        });
      }

      await Producto.actualizarStock(id_producto, producto.stock - cantidad);
      return (await Pedido.crear({ id_producto, id_cliente, cantidad })).id;
    });
    res.status(201).json(await Pedido.obtener(id));
  } catch (error) {
    responderError(res, error);
  }
};

const actualizar = async (req, res) => {
  const id = parseId(req.params.id);
  const cantidad = Number(req.body.cantidad);
  if (!isPositiveInteger(cantidad)) {
    return res.status(400).json({ error: 'La cantidad debe ser un entero positivo' });
  }

  try {
    await db.transaction(async () => {
      const pedido = await Pedido.obtenerSimple(id);
      if (!pedido) throw httpError(404, 'Pedido no encontrado');
      if (pedido.estado === 'vendido') {
        throw httpError(409, 'Un pedido vendido no puede modificarse');
      }

      const producto = await Producto.obtener(pedido.id_producto);
      const diferencia = cantidad - pedido.cantidad;
      if (diferencia > producto.stock) {
        throw httpError(409, 'Stock insuficiente', {
          stock_disponible: producto.stock,
          cantidad_adicional_solicitada: diferencia
        });
      }
      await Producto.actualizarStock(producto.id_producto, producto.stock - diferencia);
      await Pedido.actualizarCantidad(id, cantidad);
    });
    res.json(await Pedido.obtener(id));
  } catch (error) {
    responderError(res, error);
  }
};

const eliminar = async (req, res) => {
  const id = parseId(req.params.id);
  try {
    await db.transaction(async () => {
      const pedido = await Pedido.obtenerSimple(id);
      if (!pedido) throw httpError(404, 'Pedido no encontrado');
      if (pedido.estado === 'vendido') {
        throw httpError(409, 'Un pedido vendido no puede eliminarse');
      }

      const producto = await Producto.obtener(pedido.id_producto);
      await Producto.actualizarStock(
        producto.id_producto,
        producto.stock + pedido.cantidad
      );
      await Pedido.eliminar(id);
    });
    res.status(204).send();
  } catch (error) {
    responderError(res, error);
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
