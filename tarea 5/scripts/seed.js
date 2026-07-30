const { createSequelize } = require("../src/config/database");
const { defineModels } = require("../src/models");


async function seed() {
  const sequelize = createSequelize();
  const { Cliente, Producto } = defineModels(sequelize);

  try {
    await sequelize.sync();

    const [cliente] = await Cliente.findOrCreate({
      where: { nit: "123456789" },
      defaults: {
        nombre: "Ana Pérez",
        fecha_nac: "1995-05-20",
      },
    });

    const [producto] = await Producto.findOrCreate({
      where: { producto: "Teclado mecánico" },
      defaults: {
        precio_compra: 250,
        precio_venta: 350,
        stock: 20,
      },
    });

    console.log("Datos de ejemplo preparados:");
    console.log({
      id_cliente: cliente.id_cliente,
      id_producto: producto.id_producto,
    });
  } finally {
    await sequelize.close();
  }
}


seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
