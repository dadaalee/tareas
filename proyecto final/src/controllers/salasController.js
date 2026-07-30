const { sendSequelizeError } = require("../utils/errors");
const { isNonEmptyString, isPositiveInteger } = require("../utils/validation");


function validSala(body) {
  return (
    isNonEmptyString(body.nombre) &&
    isNonEmptyString(body.tipo_audio) &&
    isNonEmptyString(body.tipo_pantalla) &&
    isPositiveInteger(body.numero_butacas) &&
    typeof body.accesible === "boolean" &&
    typeof body.activa === "boolean"
  );
}


function salasController({ Sala }) {
  return {
    async listar(req, res) {
      const salas = await Sala.findAll({ order: [["id_sala", "ASC"]] });
      res.json(salas);
    },

    async obtener(req, res) {
      const sala = await Sala.findByPk(req.params.id);
      if (!sala) {
        return res.status(404).json({ error: "Sala no encontrada" });
      }
      res.json(sala);
    },

    async crear(req, res) {
      const body = { accesible: false, activa: true, ...req.body };
      if (!validSala(body)) {
        return res.status(400).json({
          error:
            "nombre, tipo_audio, tipo_pantalla, numero_butacas, accesible y activa son obligatorios",
        });
      }

      try {
        const sala = await Sala.create({
          ...body,
          nombre: body.nombre.trim(),
        });
        res.status(201).json(sala);
      } catch (error) {
        return sendSequelizeError(error, res);
      }
    },

    async actualizar(req, res) {
      const sala = await Sala.findByPk(req.params.id);
      if (!sala) {
        return res.status(404).json({ error: "Sala no encontrada" });
      }
      if (!validSala(req.body)) {
        return res.status(400).json({
          error:
            "nombre, tipo_audio, tipo_pantalla, numero_butacas, accesible y activa son obligatorios",
        });
      }

      try {
        await sala.update({ ...req.body, nombre: req.body.nombre.trim() });
        res.json(sala);
      } catch (error) {
        return sendSequelizeError(error, res);
      }
    },

    async eliminar(req, res) {
      const sala = await Sala.findByPk(req.params.id);
      if (!sala) {
        return res.status(404).json({ error: "Sala no encontrada" });
      }
      try {
        await sala.destroy();
        res.status(204).send();
      } catch (error) {
        return sendSequelizeError(error, res);
      }
    },
  };
}


module.exports = salasController;
