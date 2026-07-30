const { DataTypes } = require("sequelize");


function defineUsuario(sequelize) {
  return sequelize.define(
    "Usuario",
    {
      id_usuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { notEmpty: true },
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      rol: {
        type: DataTypes.ENUM("administrador", "cajero", "operador"),
        allowNull: false,
        defaultValue: "operador",
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "usuarios",
      timestamps: true,
      createdAt: "creado_en",
      updatedAt: "actualizado_en",
      defaultScope: {
        attributes: { exclude: ["password_hash"] },
      },
    },
  );
}


module.exports = { defineUsuario };
