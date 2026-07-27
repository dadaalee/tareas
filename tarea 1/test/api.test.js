const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
process.env.DB_PATH = ':memory:';
const app = require('../src/app');
const database = require('../src/database/database');

let server;
let baseUrl;

beforeEach(async () => {
  await database.reset();
});

test('flujo completo: pedido reserva stock y venta calcula descuento', async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const pedidoResponse = await fetch(`${baseUrl}/api/pedidos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id_cliente: 1, id_producto: 1, cantidad: 3 })
  });
  assert.equal(pedidoResponse.status, 201);
  const pedido = await pedidoResponse.json();
  assert.equal(pedido.cantidad, 3);

  const productoResponse = await fetch(`${baseUrl}/api/productos/1`);
  const producto = await productoResponse.json();
  assert.equal(producto.stock, 12);

  const ventaResponse = await fetch(`${baseUrl}/api/ventas`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id_pedido: pedido.id_pedido, descuento: 10 })
  });
  assert.equal(ventaResponse.status, 201);
  const venta = await ventaResponse.json();
  assert.equal(venta.total, 486);
});

test('rechaza un pedido cuando el stock es insuficiente', async () => {
  if (!server?.listening) {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  }

  const response = await fetch(`${baseUrl}/api/pedidos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id_cliente: 1, id_producto: 1, cantidad: 99 })
  });
  assert.equal(response.status, 409);
  const body = await response.json();
  assert.equal(body.error, 'Stock insuficiente');
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve) => server.close(resolve));
  }
  await database.close();
});
