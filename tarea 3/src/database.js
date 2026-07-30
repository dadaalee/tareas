const { mkdirSync } = require("node:fs");
const { dirname, resolve } = require("node:path");
const { DatabaseSync } = require("node:sqlite");


function createDatabase(filename = process.env.DB_FILE || "data/ventas.db") {
  const databasePath = filename === ":memory:" ? filename : resolve(filename);

  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  const db = new DatabaseSync(databasePath);
  db.exec("PRAGMA foreign_keys = ON;");

  if (databasePath !== ":memory:") {
    db.exec("PRAGMA journal_mode = WAL;");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      nit TEXT NOT NULL UNIQUE,
      fecha_nac TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS productos (
      id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
      producto TEXT NOT NULL,
      precio_compra REAL NOT NULL CHECK (precio_compra >= 0),
      precio_venta REAL NOT NULL CHECK (precio_venta >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
      id_producto INTEGER NOT NULL,
      id_cliente INTEGER NOT NULL,
      cantidad INTEGER NOT NULL CHECK (cantidad > 0),
      FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
      FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    );

    CREATE TABLE IF NOT EXISTS ventas (
      id_venta INTEGER PRIMARY KEY AUTOINCREMENT,
      id_pedido INTEGER NOT NULL UNIQUE,
      id_cliente INTEGER NOT NULL,
      id_producto INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      cantidad INTEGER NOT NULL CHECK (cantidad > 0),
      precio_unitario REAL NOT NULL CHECK (precio_unitario >= 0),
      total REAL NOT NULL CHECK (total >= 0),
      descuento REAL NOT NULL DEFAULT 0 CHECK (descuento >= 0 AND descuento <= 100),
      FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
      FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
      FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    );
  `);

  return db;
}


module.exports = { createDatabase };
