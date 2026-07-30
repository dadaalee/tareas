const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const { createApp } = require("../src/app");


let app;
let server;
let baseUrl;


async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
  });
  const body = response.status === 204 ? null : await response.json();
  return { response, body };
}


before(async () => {
  app = await createApp({ storage: ":memory:", force: true });
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});


after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await app.locals.sequelize.close();
});


test("flujo Sequelize con asociaciones, stock y venta", async () => {
  const cliente = await request("/api/clientes", {
    method: "POST",
    body: JSON.stringify({
      nombre: "Cliente ORM",
      nit: "ORM-001",
      fecha_nac: "1992-03-18",
    }),
  });
  assert.equal(cliente.response.status, 201);

  const producto = await request("/api/productos", {
    method: "POST",
    body: JSON.stringify({
      producto: "Monitor ORM",
      precio_compra: 100,
      precio_venta: 200,
      stock: 10,
    }),
  });
  assert.equal(producto.response.status, 201);

  const pedido = await request("/api/pedidos", {
    method: "POST",
    body: JSON.stringify({
      id_producto: producto.body.id_producto,
      id_cliente: cliente.body.id_cliente,
      cantidad: 3,
    }),
  });
  assert.equal(pedido.response.status, 201);
  assert.equal(pedido.body.cliente.nombre, "Cliente ORM");
  assert.equal(pedido.body.producto.producto, "Monitor ORM");

  const actualizado = await request(
    `/api/productos/${producto.body.id_producto}`,
  );
  assert.equal(actualizado.body.stock, 7);

  const sinStock = await request("/api/pedidos", {
    method: "POST",
    body: JSON.stringify({
      id_producto: producto.body.id_producto,
      id_cliente: cliente.body.id_cliente,
      cantidad: 8,
    }),
  });
  assert.equal(sinStock.response.status, 409);
  assert.equal(sinStock.body.error, "Stock insuficiente");

  const venta = await request("/api/ventas", {
    method: "POST",
    body: JSON.stringify({
      id_pedido: pedido.body.id_pedido,
      descuento: 10,
      fecha: "2026-07-27",
    }),
  });
  assert.equal(venta.response.status, 201);
  assert.equal(Number(venta.body.precio_unitario), 200);
  assert.equal(Number(venta.body.total), 540);
  assert.equal(Number(venta.body.descuento), 10);
});
