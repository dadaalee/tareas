# API de pedidos y ventas con SQLite

Backend desarrollado con Node.js, Express y SQLite. Administra clientes,
productos, pedidos y ventas mediante una API REST con almacenamiento persistente.

## Instalación y ejecución

```bash
npm install
npm start
```

El servidor estará disponible en `http://localhost:3000`. Al abrir esa dirección
se mostrará un JSON con el estado del backend y sus recursos disponibles.

La base de datos se crea automáticamente en
`src/database/pedidos-ventas.sqlite`, junto con sus tablas y datos iniciales.

Para ejecutar las pruebas:

```bash
npm test
```

## Pruebas con Thunder Client

La colección está en
`thunder-tests/collections/API-Pedidos-Ventas.json` y el ambiente local en
`thunder-tests/environments/Local.json`.

1. Inicia la API con `npm start`.
2. En Thunder Client abre **Collections → Import** e importa la colección.
3. En **Env → Import** importa `Local.json` y actívalo.
4. Ejecuta las solicitudes en orden o utiliza **Run All** en modo secuencial.

La colección verifica el estado del servidor, listados, creación de pedido,
venta con descuento, stock insuficiente y venta duplicada.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/clientes` | Listar clientes |
| GET | `/api/clientes/:id` | Obtener un cliente |
| POST | `/api/clientes` | Crear un cliente |
| PUT | `/api/clientes/:id` | Actualizar un cliente |
| DELETE | `/api/clientes/:id` | Eliminar un cliente |
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/:id` | Obtener un producto |
| POST | `/api/productos` | Crear un producto |
| PUT | `/api/productos/:id` | Actualizar un producto |
| DELETE | `/api/productos/:id` | Eliminar un producto |
| GET | `/api/pedidos` | Listar pedidos |
| GET | `/api/pedidos/:id` | Obtener un pedido |
| POST | `/api/pedidos` | Crear un pedido y reservar stock |
| PUT | `/api/pedidos/:id` | Cambiar la cantidad de un pedido |
| DELETE | `/api/pedidos/:id` | Cancelar pedido y devolver stock |
| GET | `/api/ventas` | Listar ventas |
| GET | `/api/ventas/:id` | Obtener una venta |
| POST | `/api/ventas` | Registrar la venta de un pedido |

## Ejemplos

Crear cliente:

```json
POST /api/clientes
{
  "nombre": "María López",
  "nit": "9988776",
  "fecha_nac": "1998-04-15"
}
```

Crear producto:

```json
POST /api/productos
{
  "producto": "Monitor",
  "precio_compra": 800,
  "precio_venta": 1100,
  "stock": 10
}
```

Crear pedido:

```json
POST /api/pedidos
{
  "id_producto": 1,
  "id_cliente": 1,
  "cantidad": 3
}
```

El pedido solo se crea si el stock disponible es suficiente. Al crearlo se
reserva la cantidad solicitada descontándola del stock; al cancelar un pedido
pendiente, el stock se devuelve. Estas operaciones se ejecutan dentro de una
transacción SQL para evitar inconsistencias.

Registrar venta con 10% de descuento:

```json
POST /api/ventas
{
  "id_pedido": 1,
  "descuento": 10
}
```

`id_cliente`, `id_producto`, `cantidad` y `precio_unitario` se obtienen del
pedido y del producto para evitar datos inconsistentes. El total se calcula así:

`total = precio_unitario * cantidad * (1 - descuento / 100)`

## Estructura de la base de datos

- `clientes`: id_cliente, nombre, nit, fecha_nac.
- `productos`: id_producto, producto, precio_compra, precio_venta, stock.
- `pedidos`: id_pedido, id_producto, id_cliente, cantidad, estado.
- `ventas`: id_venta, id_pedido, id_cliente, id_producto, fecha, cantidad,
  precio_unitario, total, descuento.

SQLite aplica claves primarias, claves foráneas, NIT único, valores no negativos
y cantidades enteras positivas.
