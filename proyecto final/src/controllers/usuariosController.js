const bcrypt = require("bcryptjs");
const { sendSequelizeError } = require("../utils/errors");
const { isNonEmptyString } = require("../utils/validation");


const roles = new Set(["administrador", "cajero", "operador"]);


function validEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}


function usuariosController({ Usuario }) {
  return {
    async listar(req, res) {
      const usuarios = await Usuario.findAll({
        order: [["id_usuario", "ASC"]],
      });
      res.json(usuarios);
    },

    async obtener(req, res) {
      const usuario = await Usuario.findByPk(req.params.id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json(usuario);
    },

    async crear(req, res) {
      const { nombre, email, password, rol = "operador", activo = true } =
        req.body;

      if (
        !isNonEmptyString(nombre) ||
        !validEmail(email) ||
        !isNonEmptyString(password) ||
        password.length < 8 ||
        !roles.has(rol) ||
        typeof activo !== "boolean"
      ) {
        return res.status(400).json({
          error:
            "nombre, email válido, password de al menos 8 caracteres, rol válido y activo son obligatorios",
        });
      }

      try {
        const usuario = await Usuario.create({
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          password_hash: await bcrypt.hash(password, 12),
          rol,
          activo,
        });

        const response = usuario.toJSON();
        delete response.password_hash;
        res.status(201).json(response);
      } catch (error) {
        return sendSequelizeError(error, res);
      }
    },

    async actualizar(req, res) {
      const usuario = await Usuario.unscoped().findByPk(req.params.id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const { nombre, email, password, rol, activo } = req.body;
      if (
        !isNonEmptyString(nombre) ||
        !validEmail(email) ||
        !roles.has(rol) ||
        typeof activo !== "boolean" ||
        (password !== undefined &&
          (!isNonEmptyString(password) || password.length < 8))
      ) {
        return res.status(400).json({
          error:
            "nombre, email válido, rol válido y activo son obligatorios; password opcional de al menos 8 caracteres",
        });
      }

      const changes = {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        rol,
        activo,
      };
      if (password !== undefined) {
        changes.password_hash = await bcrypt.hash(password, 12);
      }

      try {
        await usuario.update(changes);
        const response = usuario.toJSON();
        delete response.password_hash;
        res.json(response);
      } catch (error) {
        return sendSequelizeError(error, res);
      }
    },

    async eliminar(req, res) {
      const usuario = await Usuario.findByPk(req.params.id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      await usuario.destroy();
      res.status(204).send();
    },
  };
}


module.exports = usuariosController;
