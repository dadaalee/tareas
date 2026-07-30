const Cliente = require('../models/cliente.model');
const { parseId, validDate } = require('../utils');

const listar = async (req, res) => res.json(await Cliente.listar());

const obtener = async (req, res) => {
  const cliente = await Cliente.obtener(parseId(req.params.id));
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(cliente);
};

const validar = ({ nombre, nit, fecha_nac }) => {
  if (!nombre?.trim() || !String(nit || '').trim() || !validDate(fecha_nac)) {
    return 'nombre, nit y fecha_nac válida (AAAA-MM-DD) son obligatorios';
  }
  return null;
};

const crear = async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });

  const datos = {
    nombre: req.body.nombre.trim(),
    nit: String(req.body.nit).trim(),
    fecha_nac: req.body.fecha_nac
  };
  if (await Cliente.buscarPorNit(datos.nit)) {
    return res.status(409).json({ error: 'Ya existe un cliente con ese NIT' });
  }

  const { id } = await Cliente.crear(datos);
  res.status(201).json(await Cliente.obtener(id));
};

const actualizar = async (req, res) => {
  const id = parseId(req.params.id);
  const actual = await Cliente.obtener(id);
  if (!actual) return res.status(404).json({ error: 'Cliente no encontrado' });

  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  const datos = {
    nombre: req.body.nombre.trim(),
    nit: String(req.body.nit).trim(),
    fecha_nac: req.body.fecha_nac
  };
  const repetido = await Cliente.buscarPorNit(datos.nit);
  if (repetido && repetido.id_cliente !== id) {
    return res.status(409).json({ error: 'Ya existe un cliente con ese NIT' });
  }

  await Cliente.actualizar(id, datos);
  res.json(await Cliente.obtener(id));
};

const eliminar = async (req, res) => {
  const id = parseId(req.params.id);
  if (!(await Cliente.obtener(id))) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  if (await Cliente.tienePedidos(id)) {
    return res.status(409).json({ error: 'No se puede eliminar: el cliente tiene pedidos' });
  }

  await Cliente.eliminar(id);
  res.status(204).send();
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
