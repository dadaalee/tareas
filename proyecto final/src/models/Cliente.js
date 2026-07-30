const { DataTypes } = require("sequelize");


function defineCliente(sequelize) {
  return sequelize.define(
    "Cliente",
    {
      id_cliente: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { notEmpty: true },
      },
      documento: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: true,
        unique: true,
        validate: { isEmail: true },
      },
      telefono: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      fecha_nac: {
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
      tableName: "clientes",
      timestamps: true,
      createdAt: "creado_en",
      updatedAt: "actualizado_en",
    },
  );
}


module.exports = { defineCliente };
