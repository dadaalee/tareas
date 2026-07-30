const { sendSequelizeError } = require("../utils/errors");
const {
  isNonEmptyString,
  isPositiveInteger,
  isValidDate,
} = require("../utils/validation");


function validPelicula(body) {
  return (
    isNonEmptyString(body.titulo) &&
    isPositiveInteger(body.duracion_min) &&
    isNonEmptyString(body.clasificacion) &&
    isNonEmptyString(body.genero) &&
    isNonEmptyString(body.idioma) &&
    isValidDate(body.fecha_estreno, true) &&
    typeof body.activo === "boolean"
  );
}


function peliculasController({ Pelicula }) {
  return {
    async listar(req, res) {
      const peliculas = await Pelicula.findAll({
        order: [["id_pelicula", "ASC"]],
      });
      res.json(peliculas);
    },

    async obtener(req, res) {
      const pelicula = await Pelicula.findByPk(req.params.id);
      if (!pelicula) {
        return res.status(404).json({ error: "Película no encontrada" });
      }
      res.json(pelicula);
    },

    async crear(req, res) {
      const body = { idioma: "Español", activo: true, ...req.body };
      if (!validPelicula(body)) {
        return res.status(400).json({
          error:
            "titulo, duracion_min positiva, clasificacion, genero, idioma y activo son obligatorios",
        });
      }

      try {
        const pelicula = await Pelicula.create({
          ...body,
          titulo: body.titulo.trim(),
          sinopsis: body.sinopsis?.trim() || null,
          fecha_estreno: body.fecha_estreno || null,
        });
        res.status(201).json(pelicula);
      } catch (error) {
        return sendSequelizeError(error, res);
      }
    },

    async actualizar(req, res) {
      const pelicula = await Pelicula.findByPk(req.params.id);
      if (!pelicula) {
        return res.status(404).json({ error: "Película no encontrada" });
      }
      if (!validPelicula(req.body)) {
        return res.status(400).json({
          error:
            "titulo, duracion_min positiva, clasificacion, genero, idioma y activo son obligatorios",
        });
      }

      await pelicula.update({
        ...req.body,
        titulo: req.body.titulo.trim(),
        sinopsis: req.body.sinopsis?.trim() || null,
        fecha_estreno: req.body.fecha_estreno || null,
      });
      res.json(pelicula);
    },

    async eliminar(req, res) {
      const pelicula = await Pelicula.findByPk(req.params.id);
      if (!pelicula) {
        return res.status(404).json({ error: "Película no encontrada" });
      }
      try {
        await pelicula.destroy();
        res.status(204).send();
      } catch (error) {
        return sendSequelizeError(error, res);
      }
    },
  };
}


module.exports = peliculasController;
