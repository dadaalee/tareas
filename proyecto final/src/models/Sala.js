const { DataTypes } = require("sequelize");


function defineSala(sequelize) {
  return sequelize.define(
    "Sala",
    {
      id_sala: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      tipo_audio: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      tipo_pantalla: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      numero_butacas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, isInt: true },
      },
      accesible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "salas",
      timestamps: true,
      createdAt: "creado_en",
      updatedAt: "actualizado_en",
    },
  );
}


module.exports = { defineSala };
