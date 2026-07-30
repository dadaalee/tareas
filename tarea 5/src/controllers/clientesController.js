const { UniqueConstraintError } = require("sequelize");
const { isValidDate } = require("../utils/validation");


function clientesController({ Cliente }) {
  return {
    async listar(req, res) {
      const clientes = await Cliente.findAll({ order: [["id_cliente", "ASC"]] });
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
      const { nombre, nit, fecha_nac } = req.body;
      if (
        typeof nombre !== "string" ||
        !nombre.trim() ||
        typeof nit !== "string" ||
        !nit.trim() ||
        !isValidDate(fecha_nac)
      ) {
        return res.status(400).json({
          error: "nombre, nit y fecha_nac (AAAA-MM-DD) son obligatorios",
        });
      }

      try {
        const cliente = await Cliente.create({
          nombre: nombre.trim(),
          nit: nit.trim(),
          fecha_nac,
        });
        res.status(201).json(cliente);
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          return res.status(409).json({ error: "El NIT ya está registrado" });
        }
        throw error;
      }
    },

    async actualizar(req, res) {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      const { nombre, nit, fecha_nac } = req.body;
      if (
        typeof nombre !== "string" ||
        !nombre.trim() ||
        typeof nit !== "string" ||
        !nit.trim() ||
        !isValidDate(fecha_nac)
      ) {
        return res.status(400).json({
          error: "nombre, nit y fecha_nac (AAAA-MM-DD) son obligatorios",
        });
      }

      try {
        await cliente.update({
          nombre: nombre.trim(),
          nit: nit.trim(),
          fecha_nac,
        });
        res.json(cliente);
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          return res.status(409).json({ error: "El NIT ya está registrado" });
        }
        throw error;
      }
    },

    async eliminar(req, res) {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) {
        return res.status(404).json({ error: "Cliente no encontrado" });
      }

      try {
        await cliente.destroy();
        res.status(204).send();
      } catch (error) {
        if (error.name === "SequelizeForeignKeyConstraintError") {
          return res.status(409).json({
            error: "El cliente tiene pedidos o ventas relacionados",
          });
        }
        throw error;
      }
    },
  };
}


module.exports = clientesController;
