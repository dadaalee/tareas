const { defineUsuario } = require("./Usuario");
const { defineCliente } = require("./Cliente");
const { definePelicula } = require("./Pelicula");
const { defineSala } = require("./Sala");
const { defineProgramacion } = require("./Programacion");
const { defineCandybar } = require("./Candybar");


function defineModels(sequelize) {
  const Usuario = defineUsuario(sequelize);
  const Cliente = defineCliente(sequelize);
  const Pelicula = definePelicula(sequelize);
  const Sala = defineSala(sequelize);
  const Programacion = defineProgramacion(sequelize);
  const Candybar = defineCandybar(sequelize);

  Pelicula.hasMany(Programacion, {
    foreignKey: "id_pelicula",
    as: "programaciones",
    onDelete: "RESTRICT",
  });
  Programacion.belongsTo(Pelicula, {
    foreignKey: "id_pelicula",
    as: "pelicula",
  });

  Sala.hasMany(Programacion, {
    foreignKey: "id_sala",
    as: "programaciones",
    onDelete: "RESTRICT",
  });
  Programacion.belongsTo(Sala, {
    foreignKey: "id_sala",
    as: "sala",
  });

  return {
    Usuario,
    Cliente,
    Pelicula,
    Sala,
    Programacion,
    Candybar,
  };
}


module.exports = { defineModels };
