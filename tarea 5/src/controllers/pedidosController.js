const { Transaction } = require("sequelize");
const { isPositiveInteger } = require("../utils/validation");


function pedidosController(sequelize, { Cliente, Producto, Pedido, Venta }) {
  const include = [
    { model: Cliente, as: "cliente", attributes: ["id_cliente", "nombre"] },
    { model: Producto, as: "producto", attributes: ["id_producto", "producto"] },
  ];

  return {
    async listar(req, res) {
      const pedidos = await Pedido.findAll({
        include,
        order: [["id_pedido", "ASC"]],
      });
      res.json(pedidos);
    },

    async obtener(req, res) {
      const pedido = await Pedido.findByPk(req.params.id, { include });
      if (!pedido) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }
      res.json(pedido);
    },

    async crear(req, res) {
      const { id_producto, id_cliente, cantidad } = req.body;
      if (
        !isPositiveInteger(id_producto) ||
        !isPositiveInteger(id_cliente) ||
        !isPositiveInteger(cantidad)
      ) {
        return res.status(400).json({
          error: "id_producto, id_cliente y cantidad deben ser enteros positivos",
        });
      }

      let pedidoCreado;
      try {
        await sequelize.transaction(
          { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
          async (transaction) => {
            const cliente = await Cliente.findByPk(id_cliente, { transaction });
            const producto = await Producto.findByPk(id_producto, {
              transaction,
              lock: transaction.LOCK.UPDATE,
            });

            if (!cliente) {
              const error = new Error("Cliente no encontrado");
              error.status = 404;
              throw error;
            }
            if (!producto) {
              const error = new Error("Producto no encontrado");
              error.status = 404;
              throw error;
            }
            if (producto.stock < cantidad) {
              const error = new Error("Stock insuficiente");
              error.status = 409;
              error.details = {
                stock_actual: producto.stock,
                cantidad_solicitada: cantidad,
              };
              throw error;
            }

            await producto.decrement("stock", { by: cantidad, transaction });
            pedidoCreado = await Pedido.create(
              { id_producto, id_cliente, cantidad },
              { transaction },
            );
          },
        );
      } catch (error) {
        if (error.status) {
          return res
            .status(error.status)
            .json({ error: error.message, ...error.details });
        }
        throw error;
      }

      const pedido = await Pedido.findByPk(pedidoCreado.id_pedido, { include });
      res.status(201).json(pedido);
    },

    async eliminar(req, res) {
      try {
        await sequelize.transaction(async (transaction) => {
          const pedido = await Pedido.findByPk(req.params.id, {
            transaction,
            lock: transaction.LOCK.UPDATE,
          });

          if (!pedido) {
            const error = new Error("Pedido no encontrado");
            error.status = 404;
            throw error;
          }

          const venta = await Venta.findOne({
            where: { id_pedido: pedido.id_pedido },
            transaction,
          });
          if (venta) {
            const error = new Error(
              "No se puede eliminar un pedido que ya fue vendido",
            );
            error.status = 409;
            throw error;
          }

          const producto = await Producto.findByPk(pedido.id_producto, {
            transaction,
            lock: transaction.LOCK.UPDATE,
          });
          await producto.increment("stock", {
            by: pedido.cantidad,
            transaction,
          });
          await pedido.destroy({ transaction });
        });

        res.status(204).send();
      } catch (error) {
        if (error.status) {
          return res.status(error.status).json({ error: error.message });
        }
        throw error;
      }
    },
  };
}


module.exports = pedidosController;
