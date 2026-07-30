const { sendSequelizeError } = require("../utils/errors");
const {
  isNonEmptyString,
  isNonNegativeNumber,
} = require("../utils/validation");


const tipos = new Set(["producto", "combo"]);


function validCandybar(body) {
  return (
    tipos.has(body.tipo) &&
    isNonEmptyString(body.producto) &&
    isNonEmptyString(body.presentacion) &&
    isNonNegativeNumber(body.precio) &&
    Number.isInteger(body.stock) &&
    body.stock >= 0 &&
    typeof body.activo === "boolean"
  );
}


function candybarController({ Candybar }) {
  return {
    async listar(req, res) {
      const items = await Candybar.findAll({
        order: [["id_candybar", "ASC"]],
      });
      res.json(items);
    },

    async obtener(req, res) {
      const item = await Candybar.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Producto de candybar no encontrado" });
      }
      res.json(item);
    },

    async crear(req, res) {
      const body = { tipo: "producto", activo: true, ...req.body };
      if (!validCandybar(body)) {
        return res.status(400).json({
          error:
            "tipo, producto, presentacion, precio, stock y activo son obligatorios",
        });
      }

      try {
        const item = await Candybar.create({
          ...body,
          producto: body.producto.trim(),
          presentacion: body.presentacion.trim(),
          descripcion: body.descripcion?.trim() || null,
        });
        res.status(201).json(item);
      } catch (error) {
        return sendSequelizeError(error, res);
      }
    },

    async actualizar(req, res) {
      const item = await Candybar.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Producto de candybar no encontrado" });
      }
      if (!validCandybar(req.body)) {
        return res.status(400).json({
          error:
            "tipo, producto, presentacion, precio, stock y activo son obligatorios",
        });
      }

      await item.update({
        ...req.body,
        producto: req.body.producto.trim(),
        presentacion: req.body.presentacion.trim(),
        descripcion: req.body.descripcion?.trim() || null,
      });
      res.json(item);
    },

    async eliminar(req, res) {
      const item = await Candybar.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Producto de candybar no encontrado" });
      }
      await item.destroy();
      res.status(204).send();
    },
  };
}


module.exports = candybarController;
