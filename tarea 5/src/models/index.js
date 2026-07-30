const { DataTypes } = require("sequelize");


function defineModels(sequelize) {
  const Cliente = sequelize.define(
    "Cliente",
    {
      id_cliente: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true },
      },
      nit: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      fecha_nac: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: { isDate: true },
      },
    },
    { tableName: "clientes", timestamps: false },
  );

  const Producto = sequelize.define(
    "Producto",
    {
      id_producto: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      producto: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true },
      },
      precio_compra: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
      },
      precio_venta: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, isInt: true },
      },
    },
    { tableName: "productos", timestamps: false },
  );

  const Pedido = sequelize.define(
    "Pedido",
    {
      id_pedido: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, isInt: true },
      },
    },
    { tableName: "pedidos", timestamps: false },
  );

  const Venta = sequelize.define(
    "Venta",
    {
      id_venta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_pedido: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: { isDate: true },
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, isInt: true },
      },
      precio_unitario: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
      },
      total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: { min: 0 },
      },
      descuento: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, max: 100 },
      },
    },
    { tableName: "ventas", timestamps: false },
  );

  Cliente.hasMany(Pedido, {
    foreignKey: "id_cliente",
    as: "pedidos",
    onDelete: "RESTRICT",
  });
  Pedido.belongsTo(Cliente, {
    foreignKey: "id_cliente",
    as: "cliente",
  });

  Producto.hasMany(Pedido, {
    foreignKey: "id_producto",
    as: "pedidos",
    onDelete: "RESTRICT",
  });
  Pedido.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });

  Pedido.hasOne(Venta, {
    foreignKey: "id_pedido",
    as: "venta",
    onDelete: "RESTRICT",
  });
  Venta.belongsTo(Pedido, {
    foreignKey: "id_pedido",
    as: "pedido",
  });

  Cliente.hasMany(Venta, {
    foreignKey: "id_cliente",
    as: "ventas",
    onDelete: "RESTRICT",
  });
  Venta.belongsTo(Cliente, {
    foreignKey: "id_cliente",
    as: "cliente",
  });

  Producto.hasMany(Venta, {
    foreignKey: "id_producto",
    as: "ventas",
    onDelete: "RESTRICT",
  });
  Venta.belongsTo(Producto, {
    foreignKey: "id_producto",
    as: "producto",
  });

  return { Cliente, Producto, Pedido, Venta };
}


module.exports = { defineModels };
