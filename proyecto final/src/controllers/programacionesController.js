const { Op } = require("sequelize");
const { sendSequelizeError } = require("../utils/errors");
const {
  isNonEmptyString,
  isNonNegativeNumber,
  isPositiveInteger,
  isValidDate,
  isValidTime,
  timeToMinutes,
} = require("../utils/validation");


const formatos = new Set(["2D", "3D", "IMAX"]);
const estados = new Set(["programada", "cancelada", "finalizada"]);


function validProgramacion(body) {
  return (
    isPositiveInteger(body.id_pelicula) &&
    isPositiveInteger(body.id_sala) &&
    isValidDate(body.fecha) &&
    isValidTime(body.hora_inicio) &&
    isNonNegativeNumber(body.precio_entrada) &&
    formatos.has(body.formato) &&
    isNonEmptyString(body.idioma) &&
    estados.has(body.estado)
  );
}


function programacionesController(
  sequelize,
  { Pelicula, Sala, Programacion },
) {
  const include = [
    {
      model: Pelicula,
      as: "pelicula",
      attributes: [
        "id_pelicula",
        "titulo",
        "duracion_min",
        "clasificacion",
      ],
    },
    {
      model: Sala,
      as: "sala",
      attributes: [
        "id_sala",
        "nombre",
        "tipo_audio",
        "tipo_pantalla",
        "numero_butacas",
      ],
    },
  ];

  async function ensureNoScheduleConflict(body, excludeId, transaction) {
    if (body.estado === "cancelada") {
      return;
    }

    const pelicula = await Pelicula.findByPk(body.id_pelicula, { transaction });
    const sala = await Sala.findByPk(body.id_sala, { transaction });

    if (!pelicula) {
      const error = new Error("Película no encontrada");
      error.status = 404;
      throw error;
    }
    if (!sala) {
      const error = new Error("Sala no encontrada");
      error.status = 404;
      throw error;
    }
    if (!pelicula.activo || !sala.activa) {
      const error = new Error("La película o la sala no está activa");
      error.status = 409;
      throw error;
    }

    const where = {
      id_sala: body.id_sala,
      fecha: body.fecha,
      estado: { [Op.ne]: "cancelada" },
    };
    if (excludeId) {
      where.id_programacion = { [Op.ne]: excludeId };
    }

    const existing = await Programacion.findAll({
      where,
      include: [{ model: Pelicula, as: "pelicula" }],
      transaction,
    });

    const newStart = timeToMinutes(body.hora_inicio);
    const newEnd = newStart + pelicula.duracion_min;

    const conflict = existing.find((item) => {
      const start = timeToMinutes(item.hora_inicio);
      const end = start + item.pelicula.duracion_min;
      return newStart < end && newEnd > start;
    });

    if (conflict) {
      const error = new Error(
        `La sala ya está ocupada por otra función a las ${conflict.hora_inicio}`,
      );
      error.status = 409;
      throw error;
    }
  }

  return {
    async listar(req, res) {
      const programaciones = await Programacion.findAll({
        include,
        order: [
          ["fecha", "ASC"],
          ["hora_inicio", "ASC"],
        ],
      });
      res.json(programaciones);
    },

    async obtener(req, res) {
      const programacion = await Programacion.findByPk(req.params.id, {
        include,
      });
      if (!programacion) {
        return res.status(404).json({ error: "Programación no encontrada" });
      }
      res.json(programacion);
    },

    async crear(req, res) {
      const body = {
        formato: "2D",
        idioma: "Español",
        estado: "programada",
        ...req.body,
      };
      if (!validProgramacion(body)) {
        return res.status(400).json({
          error:
            "película, sala, fecha, hora, precio, formato, idioma y estado válidos son obligatorios",
        });
      }

      try {
        let created;
        await sequelize.transaction(async (transaction) => {
          await ensureNoScheduleConflict(body, null, transaction);
          created = await Programacion.create(body, { transaction });
        });
        const programacion = await Programacion.findByPk(
          created.id_programacion,
          { include },
        );
        res.status(201).json(programacion);
      } catch (error) {
        if (error.status) {
          return res.status(error.status).json({ error: error.message });
        }
        return sendSequelizeError(error, res);
      }
    },

    async actualizar(req, res) {
      const programacion = await Programacion.findByPk(req.params.id);
      if (!programacion) {
        return res.status(404).json({ error: "Programación no encontrada" });
      }
      if (!validProgramacion(req.body)) {
        return res.status(400).json({
          error:
            "película, sala, fecha, hora, precio, formato, idioma y estado válidos son obligatorios",
        });
      }

      try {
        await sequelize.transaction(async (transaction) => {
          await ensureNoScheduleConflict(
            req.body,
            programacion.id_programacion,
            transaction,
          );
          await programacion.update(req.body, { transaction });
        });
        const updated = await Programacion.findByPk(
          programacion.id_programacion,
          { include },
        );
        res.json(updated);
      } catch (error) {
        if (error.status) {
          return res.status(error.status).json({ error: error.message });
        }
        return sendSequelizeError(error, res);
      }
    },

    async eliminar(req, res) {
      const programacion = await Programacion.findByPk(req.params.id);
      if (!programacion) {
        return res.status(404).json({ error: "Programación no encontrada" });
      }
      await programacion.destroy();
      res.status(204).send();
    },
  };
}


module.exports = programacionesController;
