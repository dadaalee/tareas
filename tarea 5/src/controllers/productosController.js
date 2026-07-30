const { isNonNegativeNumber } = require("../utils/validation");


function validProduct({ producto, precio_compra, precio_venta, stock }) {
  return (
    typeof producto === "string" &&
    Boolean(producto.trim()) &&
    isNonNegativeNumber(precio_compra) &&
    isNonNegativeNumber(precio_venta) &&
    Number.isInteger(stock) &&
    stock >= 0
  );
}


function productosController({ Producto }) {
  return {
    async listar(req, res) {
      const productos = await Producto.findAll({
        order: [["id_producto", "ASC"]],
      });
      res.json(productos);
    },

    async obtener(req, res) {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      res.json(producto);
    },

    async crear(req, res) {
      if (!validProduct(req.body)) {
        return res.status(400).json({
          error:
            "producto, precios no negativos y stock entero no negativo son obligatorios",
        });
      }

      const producto = await Producto.create({
        ...req.body,
        producto: req.body.producto.trim(),
      });
      res.status(201).json(producto);
    },

    async actualizar(req, res) {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      if (!validProduct(req.body)) {
        return res.status(400).json({
          error:
            "producto, precios no negativos y stock entero no negativo son obligatorios",
        });
      }

      await producto.update({
        ...req.body,
        producto: req.body.producto.trim(),
      });
      res.json(producto);
    },

    async eliminar(req, res) {
      const producto = await Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      try {
        await producto.destroy();
        res.status(204).send();
      } catch (error) {
        if (error.name === "SequelizeForeignKeyConstraintError") {
          return res.status(409).json({
            error: "El producto tiene pedidos o ventas relacionados",
          });
        }
        throw error;
      }
    },
  };
}


module.exports = productosController;
