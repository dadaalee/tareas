const { DataTypes } = require("sequelize");


function definePelicula(sequelize) {
  return sequelize.define(
    "Pelicula",
    {
      id_pelicula: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      titulo: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true },
      },
      sinopsis: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      duracion_min: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, isInt: true },
      },
      clasificacion: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      genero: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      idioma: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Español",
      },
      fecha_estreno: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: { isDate: true },
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "peliculas",
      timestamps: true,
      createdAt: "creado_en",
      updatedAt: "actualizado_en",
    },
  );
}


module.exports = { definePelicula };
