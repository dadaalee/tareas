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


async function post(path, body) {
  return request(path, { method: "POST", body: JSON.stringify(body) });
}


async function put(path, body) {
  return request(path, { method: "PUT", body: JSON.stringify(body) });
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


test("CRUD completo del Cine Los Patitos", async () => {
  const usuario = await post("/api/usuarios", {
    nombre: "Usuario de prueba",
    email: "usuario@prueba.com",
    password: "ClaveSegura123",
    rol: "cajero",
    activo: true,
  });
  assert.equal(usuario.response.status, 201);
  assert.equal(usuario.body.password_hash, undefined);

  const usuarioActualizado = await put(
    `/api/usuarios/${usuario.body.id_usuario}`,
    {
      nombre: "Usuario actualizado",
      email: "usuario@prueba.com",
      rol: "operador",
      activo: true,
    },
  );
  assert.equal(usuarioActualizado.response.status, 200);
  assert.equal(usuarioActualizado.body.rol, "operador");

  const cliente = await post("/api/clientes", {
    nombre: "Cliente de prueba",
    documento: "TEST-001",
    email: "cliente@prueba.com",
    telefono: "70000000",
    fecha_nac: "1990-01-15",
    activo: true,
  });
  assert.equal(cliente.response.status, 201);

  const clienteActualizado = await put(
    `/api/clientes/${cliente.body.id_cliente}`,
    {
      nombre: "Cliente actualizado",
      documento: "TEST-001",
      email: "cliente@prueba.com",
      telefono: "71111111",
      fecha_nac: "1990-01-15",
      activo: true,
    },
  );
  assert.equal(clienteActualizado.body.telefono, "71111111");

  const pelicula = await post("/api/peliculas", {
    titulo: "Película de prueba",
    sinopsis: "Sinopsis para pruebas.",
    duracion_min: 120,
    clasificacion: "ATP",
    genero: "Aventura",
    idioma: "Español",
    fecha_estreno: "2026-07-30",
    activo: true,
  });
  assert.equal(pelicula.response.status, 201);

  const sala = await post("/api/salas", {
    nombre: "Sala Test",
    tipo_audio: "Dolby Atmos",
    tipo_pantalla: "4K",
    numero_butacas: 80,
    accesible: true,
    activa: true,
  });
  assert.equal(sala.response.status, 201);

  const programacion = await post("/api/programaciones", {
    id_pelicula: pelicula.body.id_pelicula,
    id_sala: sala.body.id_sala,
    fecha: "2026-08-10",
    hora_inicio: "18:00",
    precio_entrada: 45,
    formato: "2D",
    idioma: "Español",
    estado: "programada",
  });
  assert.equal(programacion.response.status, 201);
  assert.equal(programacion.body.pelicula.titulo, "Película de prueba");
  assert.equal(programacion.body.sala.nombre, "Sala Test");

  const conflicto = await post("/api/programaciones", {
    id_pelicula: pelicula.body.id_pelicula,
    id_sala: sala.body.id_sala,
    fecha: "2026-08-10",
    hora_inicio: "19:00",
    precio_entrada: 45,
    formato: "2D",
    idioma: "Español",
    estado: "programada",
  });
  assert.equal(conflicto.response.status, 409);

  const programacionActualizada = await put(
    `/api/programaciones/${programacion.body.id_programacion}`,
    {
      id_pelicula: pelicula.body.id_pelicula,
      id_sala: sala.body.id_sala,
      fecha: "2026-08-10",
      hora_inicio: "20:30",
      precio_entrada: 50,
      formato: "3D",
      idioma: "Español",
      estado: "programada",
    },
  );
  assert.equal(programacionActualizada.response.status, 200);
  assert.equal(programacionActualizada.body.formato, "3D");

  const candy = await post("/api/candybar", {
    tipo: "combo",
    producto: "Combo Test",
    presentacion: "Individual",
    descripcion: "Pipoca y bebida.",
    precio: 35,
    stock: 20,
    activo: true,
  });
  assert.equal(candy.response.status, 201);

  const candyActualizado = await put(
    `/api/candybar/${candy.body.id_candybar}`,
    {
      tipo: "combo",
      producto: "Combo Test",
      presentacion: "Individual grande",
      descripcion: "Pipoca grande y bebida.",
      precio: 40,
      stock: 18,
      activo: true,
    },
  );
  assert.equal(Number(candyActualizado.body.precio), 40);

  for (const endpoint of [
    "usuarios",
    "clientes",
    "peliculas",
    "salas",
    "programaciones",
    "candybar",
  ]) {
    const listado = await request(`/api/${endpoint}`);
    assert.equal(listado.response.status, 200);
    assert.equal(Array.isArray(listado.body), true);
  }

  const deletions = [
    `/api/programaciones/${programacion.body.id_programacion}`,
    `/api/peliculas/${pelicula.body.id_pelicula}`,
    `/api/salas/${sala.body.id_sala}`,
    `/api/candybar/${candy.body.id_candybar}`,
    `/api/clientes/${cliente.body.id_cliente}`,
    `/api/usuarios/${usuario.body.id_usuario}`,
  ];

  for (const path of deletions) {
    const deleted = await request(path, { method: "DELETE" });
    assert.equal(deleted.response.status, 204);
  }
});
