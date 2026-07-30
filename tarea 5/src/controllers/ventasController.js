const {
  isNonNegativeNumber,
  isPositiveInteger,
  isValidDate,
  roundMoney,
} = require("../utils/validation");


function ventasController(sequelize, { Cliente, Producto, Pedido, Venta }) {
  const include = [
    { model: Cliente, as: "cliente", attributes: ["id_cliente", "nombre"] },
    { model: Producto, as: "producto", attributes: ["id_producto", "producto"] },
    { model: Pedido, as: "pedido", attributes: ["id_pedido"] },
  ];

  return {
    async listar(req, res) {
      const ventas = await Venta.findAll({
        include,
        order: [["id_venta", "ASC"]],
      });
      res.json(ventas);
    },

    async obtener(req, res) {
      const venta = await Venta.findByPk(req.params.id, { include });
      if (!venta) {
        return res.status(404).json({ error: "Venta no encontrada" });
      }
      res.json(venta);
    },

    async crear(req, res) {
      const {
        id_pedido,
        descuento = 0,
        fecha = new Date().toISOString().slice(0, 10),
      } = req.body;

      if (
        !isPositiveInteger(id_pedido) ||
        !isNonNegativeNumber(descuento) ||
        descuento > 100 ||
        !isValidDate(fecha)
      ) {
        return res.status(400).json({
          error:
            "id_pedido debe ser positivo, descuento debe estar entre 0 y 100 y fecha debe usar AAAA-MM-DD",
        });
      }

      let ventaCreada;
      try {
        await sequelize.transaction(async (transaction) => {
          const pedido = await Pedido.findByPk(id_pedido, {
            include: [{ model: Producto, as: "producto" }],
            transaction,
            lock: transaction.LOCK.UPDATE,
          });

          if (!pedido) {
            const error = new Error("Pedido no encontrado");
            error.status = 404;
            throw error;
          }

          const existente = await Venta.findOne({
            where: { id_pedido },
            transaction,
          });
          if (existente) {
            const error = new Error(
              "El pedido ya tiene una venta registrada",
            );
            error.status = 409;
            throw error;
          }

          const precioUnitario = Number(pedido.producto.precio_venta);
          const subtotal = pedido.cantidad * precioUnitario;
          const total = roundMoney(subtotal * (1 - descuento / 100));

          ventaCreada = await Venta.create(
            {
              id_pedido,
              id_cliente: pedido.id_cliente,
              id_producto: pedido.id_producto,
              fecha,
              cantidad: pedido.cantidad,
              precio_unitario: precioUnitario,
              total,
              descuento,
            },
            { transaction },
          );
        });
      } catch (error) {
        if (error.status) {
          return res.status(error.status).json({ error: error.message });
        }
        throw error;
      }

      const venta = await Venta.findByPk(ventaCreada.id_venta, { include });
      res.status(201).json(venta);
    },
  };
}


module.exports = ventasController;
