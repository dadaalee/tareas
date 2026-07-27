const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

const databasePath =
  process.env.DB_PATH || path.join(__dirname, 'pedidos-ventas.sqlite');
const connection = new sqlite3.Database(databasePath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    connection.run(sql, params, function callback(error) {
      if (error) return reject(error);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    connection.get(sql, params, (error, row) => {
      if (error) return reject(error);
      resolve(row);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    connection.all(sql, params, (error, rows) => {
      if (error) return reject(error);
      resolve(rows);
    });
  });

const exec = (sql) =>
  new Promise((resolve, reject) => {
    connection.exec(sql, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });

const seed = async () => {
  const { total } = await get('SELECT COUNT(*) AS total FROM clientes');
  if (total > 0) return;

  await run(
    'INSERT INTO clientes (nombre, nit, fecha_nac) VALUES (?, ?, ?), (?, ?, ?)',
    ['Ana Pérez', '1234567', '1995-05-20', 'Luis Flores', '7654321', '1990-11-08']
  );
  await run(
    `INSERT INTO productos
      (producto, precio_compra, precio_venta, stock)
     VALUES (?, ?, ?, ?), (?, ?, ?, ?)`,
    ['Teclado', 120, 180, 15, 'Mouse', 60, 95, 20]
  );
};

const initialize = async () => {
  await exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

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
      stock INTEGER NOT NULL CHECK (stock >= 0)
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
      id_producto INTEGER NOT NULL,
      id_cliente INTEGER NOT NULL,
      cantidad INTEGER NOT NULL CHECK (cantidad > 0),
      estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'vendido')),
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
      descuento REAL NOT NULL DEFAULT 0 CHECK (descuento BETWEEN 0 AND 100),
      FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
      FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
      FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
    );
  `);
  await seed();
};

const ready = initialize();

let transactionQueue = Promise.resolve();

const executeTransaction = async (operation) => {
  await ready;
  await exec('BEGIN IMMEDIATE');
  try {
    const result = await operation();
    await exec('COMMIT');
    return result;
  } catch (error) {
    await exec('ROLLBACK');
    throw error;
  }
};

const transaction = (operation) => {
  const result = transactionQueue.then(
    () => executeTransaction(operation),
    () => executeTransaction(operation)
  );
  transactionQueue = result.catch(() => {});
  return result;
};

const reset = async () => {
  await ready;
  await exec(`
    DELETE FROM ventas;
    DELETE FROM pedidos;
    DELETE FROM productos;
    DELETE FROM clientes;
    DELETE FROM sqlite_sequence
      WHERE name IN ('ventas', 'pedidos', 'productos', 'clientes');
  `);
  await seed();
};

const close = () =>
  new Promise((resolve, reject) => {
    connection.close((error) => (error ? reject(error) : resolve()));
  });

module.exports = { run, get, all, exec, ready, transaction, reset, close, databasePath };
