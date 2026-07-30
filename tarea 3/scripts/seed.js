const { createDatabase } = require("../src/database");


const db = createDatabase();

try {
  const cliente = db
    .prepare("SELECT id_cliente FROM clientes WHERE nit = ?")
    .get("123456789");

  const idCliente =
    cliente?.id_cliente ??
    db
      .prepare(
        "INSERT INTO clientes (nombre, nit, fecha_nac) VALUES (?, ?, ?)",
      )
      .run("Ana Pérez", "123456789", "1995-05-20").lastInsertRowid;

  const producto = db
    .prepare("SELECT id_producto FROM productos WHERE producto = ?")
    .get("Teclado mecánico");

  const idProducto =
    producto?.id_producto ??
    db
      .prepare(
        `INSERT INTO productos
          (producto, precio_compra, precio_venta, stock)
         VALUES (?, ?, ?, ?)`,
      )
      .run("Teclado mecánico", 250, 350, 20).lastInsertRowid;

  console.log("Datos de ejemplo preparados:");
  console.log({ id_cliente: idCliente, id_producto: idProducto });
} finally {
  db.close();
}
