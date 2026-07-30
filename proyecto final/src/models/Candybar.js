const { DataTypes } = require("sequelize");


function defineCandybar(sequelize) {
  return sequelize.define(
    "Candybar",
    {
      id_candybar: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tipo: {
        type: DataTypes.ENUM("producto", "combo"),
        allowNull: false,
        defaultValue: "producto",
      },
      producto: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { notEmpty: true },
      },
      presentacion: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, isInt: true },
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "candybar",
      timestamps: true,
      createdAt: "creado_en",
      updatedAt: "actualizado_en",
    },
  );
}


module.exports = { defineCandybar };
