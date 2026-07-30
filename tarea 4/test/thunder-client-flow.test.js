const { test, after } = require('node:test');
const assert = require('node:assert/strict');

process.env.DB_PATH = ':memory:';
const app = require('../src/app');
const database = require('../src/database/database');

let server;

const request = async (baseUrl, method, path, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: response.status, body: await response.json() };
};

test('flujo secuencial equivalente a la colección de Thunder Client', async () => {
  await database.reset();
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const resultados = [];
  resultados.push(await request(baseUrl, 'GET', '/'));
  resultados.push(await request(baseUrl, 'GET', '/api/clientes'));
  resultados.push(await request(baseUrl, 'GET', '/api/productos'));
  resultados.push(
    await request(baseUrl, 'POST', '/api/pedidos', {
      id_cliente: 1,
      id_producto: 1,
      cantidad: 3
    })
  );
  resultados.push(
    await request(baseUrl, 'POST', '/api/ventas', {
      id_pedido: 1,
      descuento: 10
    })
  );
  resultados.push(
    await request(baseUrl, 'POST', '/api/pedidos', {
      id_cliente: 1,
      id_producto: 2,
      cantidad: 999
    })
  );
  resultados.push(
    await request(baseUrl, 'POST', '/api/ventas', {
      id_pedido: 1,
      descuento: 10
    })
  );

  assert.deepEqual(
    resultados.map(({ status }) => status),
    [200, 200, 200, 201, 201, 409, 409]
  );
  assert.equal(resultados[0].body.estado, 'activo');
  assert.equal(resultados[3].body.estado, 'pendiente');
  assert.equal(resultados[4].body.total, 486);
  assert.equal(resultados[5].body.error, 'Stock insuficiente');
  assert.equal(resultados[6].body.error, 'El pedido ya tiene una venta registrada');
});

after(async () => {
  if (server?.listening) {
    await new Promise((resolve) => server.close(resolve));
  }
  await database.close();
});
