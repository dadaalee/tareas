const { DataTypes } = require("sequelize");


function defineProgramacion(sequelize) {
  return sequelize.define(
    "Programacion",
    {
      id_programacion: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_pelicula: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_sala: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: { isDate: true },
      },
      hora_inicio: {
        type: DataTypes.STRING(5),
        allowNull: false,
        validate: { is: /^([01]\d|2[0-3]):[0-5]\d$/ },
      },
      precio_entrada: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
      },
      formato: {
        type: DataTypes.ENUM("2D", "3D", "IMAX"),
        allowNull: false,
        defaultValue: "2D",
      },
      idioma: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Español",
      },
      estado: {
        type: DataTypes.ENUM("programada", "cancelada", "finalizada"),
        allowNull: false,
        defaultValue: "programada",
      },
    },
    {
      tableName: "programaciones",
      timestamps: true,
      createdAt: "creado_en",
      updatedAt: "actualizado_en",
      indexes: [
        {
          unique: true,
          fields: ["id_sala", "fecha", "hora_inicio"],
        },
      ],
    },
  );
}


module.exports = { defineProgramacion };
