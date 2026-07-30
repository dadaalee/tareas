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
  app = createApp(":memory:");
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});


after(async () => {
  await new Promise((resolve) => server.close(resolve));
  app.locals.db.close();
});


test("flujo completo con control de stock y cálculo de venta", async () => {
  const cliente = await request("/api/clientes", {
    method: "POST",
    body: JSON.stringify({
      nombre: "Cliente de prueba",
      nit: "NIT-001",
      fecha_nac: "1990-01-15",
    }),
  });
  assert.equal(cliente.response.status, 201);

  const producto = await request("/api/productos", {
    method: "POST",
    body: JSON.stringify({
      producto: "Monitor",
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

  const productoActualizado = await request(
    `/api/productos/${producto.body.id_producto}`,
  );
  assert.equal(productoActualizado.body.stock, 7);

  const pedidoSinStock = await request("/api/pedidos", {
    method: "POST",
    body: JSON.stringify({
      id_producto: producto.body.id_producto,
      id_cliente: cliente.body.id_cliente,
      cantidad: 8,
    }),
  });
  assert.equal(pedidoSinStock.response.status, 409);
  assert.equal(pedidoSinStock.body.error, "Stock insuficiente");

  const venta = await request("/api/ventas", {
    method: "POST",
    body: JSON.stringify({
      id_pedido: pedido.body.id_pedido,
      descuento: 10,
      fecha: "2026-07-27",
    }),
  });
  assert.equal(venta.response.status, 201);
  assert.equal(venta.body.cantidad, 3);
  assert.equal(venta.body.precio_unitario, 200);
  assert.equal(venta.body.descuento, 10);
  assert.equal(venta.body.total, 540);
});
