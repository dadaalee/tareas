const bcrypt = require("bcryptjs");
const { createSequelize } = require("../src/config/database");
const { defineModels } = require("../src/models");


async function seed() {
  const sequelize = createSequelize();
  const { Usuario, Cliente, Pelicula, Sala, Programacion, Candybar } =
    defineModels(sequelize);

  try {
    await sequelize.sync();

    const [usuario] = await Usuario.unscoped().findOrCreate({
      where: { email: "admin@cinelospatitos.com" },
      defaults: {
        nombre: "Administrador",
        password_hash: await bcrypt.hash("Patitos2026!", 12),
        rol: "administrador",
        activo: true,
      },
    });

    const [cliente] = await Cliente.findOrCreate({
      where: { documento: "CI-1234567" },
      defaults: {
        nombre: "Ana Pérez",
        email: "ana@example.com",
        telefono: "70000001",
        fecha_nac: "1995-05-20",
        activo: true,
      },
    });

    const [pelicula] = await Pelicula.findOrCreate({
      where: { titulo: "La Aventura de los Patitos" },
      defaults: {
        sinopsis: "Una aventura familiar llena de humor y amistad.",
        duracion_min: 105,
        clasificacion: "ATP",
        genero: "Animación",
        idioma: "Español",
        fecha_estreno: "2026-07-25",
        activo: true,
      },
    });

    const [sala] = await Sala.findOrCreate({
      where: { nombre: "Sala 1" },
      defaults: {
        tipo_audio: "Dolby Atmos",
        tipo_pantalla: "4K",
        numero_butacas: 120,
        accesible: true,
        activa: true,
      },
    });

    const [programacion] = await Programacion.findOrCreate({
      where: {
        id_sala: sala.id_sala,
        fecha: "2026-08-01",
        hora_inicio: "18:30",
      },
      defaults: {
        id_pelicula: pelicula.id_pelicula,
        precio_entrada: 45,
        formato: "2D",
        idioma: "Español",
        estado: "programada",
      },
    });

    const [producto] = await Candybar.findOrCreate({
      where: { producto: "Pipocas", presentacion: "Grande" },
      defaults: {
        tipo: "producto",
        descripcion: "Pipocas saladas en envase grande.",
        precio: 30,
        stock: 100,
        activo: true,
      },
    });

    const [combo] = await Candybar.findOrCreate({
      where: { producto: "Combo Patito", presentacion: "Para dos" },
      defaults: {
        tipo: "combo",
        descripcion: "Dos bebidas medianas y una pipoca grande.",
        precio: 55,
        stock: 40,
        activo: true,
      },
    });

    console.log("Datos iniciales preparados:");
    console.log({
      id_usuario: usuario.id_usuario,
      id_cliente: cliente.id_cliente,
      id_pelicula: pelicula.id_pelicula,
      id_sala: sala.id_sala,
      id_programacion: programacion.id_programacion,
      candybar: [producto.id_candybar, combo.id_candybar],
    });
  } finally {
    await sequelize.close();
  }
}


seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
