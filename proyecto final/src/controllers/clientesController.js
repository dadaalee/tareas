const { sendSequelizeError } = require("../utils/errors");
const { isNonEmptyString, isValidDate } = require("../utils/validation");


function validEmail(value) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
  );
}


function validCliente(body) {
  return (
    isNonEmptyString(body.nombre) &&
    isNonEmptyString(body.documento) &&
    validEmail(body.email) &&
    isValidDate(body.fecha_nac, true) &&
    (body.telefono === null ||
      body.telefono === undefined ||
      typeof body.telefono === "string") &&
    typeof body.activo === "boolean"
  );
}


function clientesController({ Cliente }) {
  return {
    async listar(req, res) {
      const clientes = await Cliente.findAll({
        order: [["id_cliente", "ASC"]],
      });
      res.json(clientes);
    },

    async obtener(req, res) {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }
      res.json(cliente);
    },

    async crear(req, res) {
      const body = { activo: true, ...req.body };
      if (!validCliente(body)) {
        return res.status(400).json({
          error:
            "nombre, documento y activo son obligatorios; email y fecha_nac deben tener formato válido",
        });
      }

      try {
        const cliente = await Cliente.create({
          ...body,
          nombre: body.nombre.trim(),
          documento: body.documento.trim(),
          email: body.email?.trim().toLowerCase() || null,
          telefono: body.telefono?.trim() || null,
          fecha_nac: body.fecha_nac || null,
        });
        res.status(201).json(cliente);
      } catch (error) {
        return sendSequelizeError(error, res);
      }
    },

    async actualizar(req, res) {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }
      if (!validCliente(req.body)) {
        return res.status(400).json({
          error:
            "nombre, documento y activo son obligatorios; email y fecha_nac deben tener formato válido",
        });
      }

      try {
        await cliente.update({
          ...req.body,
          nombre: req.body.nombre.trim(),
          documento: req.body.documento.trim(),
          email: req.body.email?.trim().toLowerCase() || null,
          telefono: req.body.telefono?.trim() || null,
          fecha_nac: req.body.fecha_nac || null,
        });
        res.json(cliente);
      } catch (error) {
        return sendSequelizeError(error, res);
      }
    },

    async eliminar(req, res) {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }
      await cliente.destroy();
      res.status(204).send();
    },
  };
}


module.exports = clientesController;
