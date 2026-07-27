const Producto = require('../models/producto.model');
const { isNonNegativeNumber, parseId } = require('../utils');

const listar = async (req, res) => res.json(await Producto.listar());

const obtener = async (req, res) => {
  const producto = await Producto.obtener(parseId(req.params.id));
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
};

const validar = ({ producto, precio_compra, precio_venta, stock }) => {
  if (!producto?.trim()) return 'El nombre del producto es obligatorio';
  if (![precio_compra, precio_venta, stock].every(isNonNegativeNumber)) {
    return 'Los precios y el stock deben ser números mayores o iguales a cero';
  }
  if (!Number.isInteger(Number(stock))) return 'El stock debe ser un número entero';
  return null;
};

const normalizar = (body) => ({
  producto: body.producto.trim(),
  precio_compra: Number(body.precio_compra),
  precio_venta: Number(body.precio_venta),
  stock: Number(body.stock)
});

const crear = async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  const { id } = await Producto.crear(normalizar(req.body));
  res.status(201).json(await Producto.obtener(id));
};

const actualizar = async (req, res) => {
  const id = parseId(req.params.id);
  if (!(await Producto.obtener(id))) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });

  await Producto.actualizar(id, normalizar(req.body));
  res.json(await Producto.obtener(id));
};

const eliminar = async (req, res) => {
  const id = parseId(req.params.id);
  if (!(await Producto.obtener(id))) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  if (await Producto.tienePedidos(id)) {
    return res.status(409).json({ error: 'No se puede eliminar: el producto tiene pedidos' });
  }

  await Producto.eliminar(id);
  res.status(204).send();
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
