# Proyecto Final: Backend del Cine Los Patitos

API REST desarrollada con Node.js, Express, Sequelize ORM y SQLite.
El proyecto es exclusivamente backend.

## Funcionalidades

- CRUD de usuarios.
- CRUD de clientes.
- CRUD de películas.
- CRUD de salas.
- CRUD de programación.
- CRUD de productos y combos del candybar.
- Relaciones Sequelize entre películas, salas y programación.
- Validación de funciones superpuestas en una misma sala.
- Contraseñas almacenadas con hash `bcrypt`.
- Respuestas y errores en formato JSON.

## Instalación

```powershell
npm install
npm run seed
npm start
```

Servidor:

```text
http://localhost:3003
```

Estado de la API:

```text
GET http://localhost:3003/api/health
```

## Endpoints

Todos los recursos permiten las cinco operaciones mínimas solicitadas.

| Recurso | Listar/crear | Buscar/actualizar/eliminar |
| --- | --- | --- |
| Usuarios | `GET, POST /api/usuarios` | `GET, PUT, DELETE /api/usuarios/:id` |
| Clientes | `GET, POST /api/clientes` | `GET, PUT, DELETE /api/clientes/:id` |
| Películas | `GET, POST /api/peliculas` | `GET, PUT, DELETE /api/peliculas/:id` |
| Salas | `GET, POST /api/salas` | `GET, PUT, DELETE /api/salas/:id` |
| Programación | `GET, POST /api/programaciones` | `GET, PUT, DELETE /api/programaciones/:id` |
| Candybar | `GET, POST /api/candybar` | `GET, PUT, DELETE /api/candybar/:id` |

## Campos

### Usuarios

`id_usuario`, `nombre`, `email`, `password`, `rol`, `activo`.

Roles permitidos: `administrador`, `cajero`, `operador`.
La API nunca devuelve el hash de la contraseña.

### Clientes

`id_cliente`, `nombre`, `documento`, `email`, `telefono`, `fecha_nac`,
`activo`.

### Películas

`id_pelicula`, `titulo`, `sinopsis`, `duracion_min`, `clasificacion`,
`genero`, `idioma`, `fecha_estreno`, `activo`.

### Salas

`id_sala`, `nombre`, `tipo_audio`, `tipo_pantalla`, `numero_butacas`,
`accesible`, `activa`.

### Programación

`id_programacion`, `id_pelicula`, `id_sala`, `fecha`, `hora_inicio`,
`precio_entrada`, `formato`, `idioma`, `estado`.

Formatos: `2D`, `3D`, `IMAX`.

Estados: `programada`, `cancelada`, `finalizada`.

La API usa la duración de la película para impedir que dos funciones
ocupen la misma sala al mismo tiempo.

### Candybar

`id_candybar`, `tipo`, `producto`, `presentacion`, `descripcion`, `precio`,
`stock`, `activo`.

Tipos: `producto`, `combo`.

## Ejemplos

Crear una película:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:3003/api/peliculas `
  -ContentType "application/json" `
  -Body '{
    "titulo":"Patitos al rescate",
    "sinopsis":"Una aventura familiar.",
    "duracion_min":110,
    "clasificacion":"ATP",
    "genero":"Animación",
    "idioma":"Español",
    "fecha_estreno":"2026-08-01",
    "activo":true
  }'
```

Crear una programación:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:3003/api/programaciones `
  -ContentType "application/json" `
  -Body '{
    "id_pelicula":1,
    "id_sala":1,
    "fecha":"2026-08-01",
    "hora_inicio":"18:30",
    "precio_entrada":45,
    "formato":"2D",
    "idioma":"Español",
    "estado":"programada"
  }'
```

## Datos iniciales

`npm run seed` crea:

- Un usuario administrador.
- Un cliente.
- Una película.
- Una sala.
- Una función programada.
- Un producto y un combo de candybar.

Credenciales iniciales para fines académicos:

```text
Email: admin@cinelospatitos.com
Contraseña: Patitos2026!
```

## Pruebas

```powershell
npm test
```

La prueba automatizada verifica CRUD, asociaciones y rechazo de horarios
superpuestos.
